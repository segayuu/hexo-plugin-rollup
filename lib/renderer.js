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

function bundleAsync(config, errlog) {
  return Promise
    .resolve(rollup(config))
    .call("generate", genarateArgs)
    .get("code")
    .tapCatch(Error, errlog)
    .catchThrow(new Error('RollupRenderer Error.'));
}

function getRender(configObj, logger) {
  const warningCallback = getWarningCallback(logger);
  const errorLogging = getErrorLogging(logger);

  function renderAsync(data) {
    const { path, text } = data;
    if (!configObj.isEntry(path)) {
      return Promise.resolve(text);
    }
    const config = configObj.getConfig(data);
    config.onwarn = warningCallback;
    return bundleAsync(config, errorLogging);
  }

  return renderAsync;
}

function exportsModule(hexo) {
  if (null == hexo) {
    throw new Error('required argument Hexo!');
  }
  return getRender(config(hexo), hexo.log);
}

module.exports = exportsModule;