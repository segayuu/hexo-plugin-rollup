'use strict';
/**
 * Created by tumugu2 on 2016/12/15.
 */
const { rollup } = require('rollup');
const config = require('./config');
const Promise = require("bluebird");

function getWarningCallback(logger) {
  function warningCallback({ loc, frame, message }) {
    if (loc) {
      logger.warn('RollupRendererPlugin: "%s": %s (%i:%i)', message, loc.file, loc.line, loc.column);
      if (frame) logger.warn(frame);
    } else {
      logger.warn("RollupRendererPlugin: \"%s\"", message);
    }
  }
  return warningCallback;
}

function getErrorLogging(logger) {
  function errorLogging(err) {
    logger.error('RollupRendererPlugin: "%s"', err.message);
  }
  return errorLogging;
}

const genarateArgs = {
  format: 'iife',
  moduleName: 'hexo_rollup'
};

function getBody(configObj, logger) {
  const warningCallback = getWarningCallback(logger);
  const errorLogging = getErrorLogging(logger);

  function body(data) {
    const { path, text: contents } = data;
    if (!configObj.isEntry(path)) {
      return Promise.resolve(contents);
    }
    const config = configObj.getConfig(data);
    config.onwarn = warningCallback;

    return Promise
      .resolve(rollup(config))
      .call("generate", genarateArgs)
      .get("code")
      .tapCatch(Error, errorLogging)
      .catchThrow(new Error('RollupRenderer Error.'));
  }

  return body;
}

function exportsModule(hexo) {
  if (null == hexo) {
    throw new Error('required argument Hexo!');
  }
  return getBody(config(hexo), hexo.log);
}

module.exports = exportsModule;