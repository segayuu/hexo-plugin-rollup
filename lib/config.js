'use strict';
const { tryLoadErrors, allLoad: loadPlugin } = require("./loadplugin");
const Internal = require("./_config");
const { ConfigContext } = Internal;
const { checkHexoInit } = require("./utility");

function warnningOfTryLoadErrors(logger) {
  for (let msg of tryLoadErrors) {
    logger.warn(msg);
  }
}
/**
 *
 * @param {ConfigContext} c_ctx
 * @param {Logger} logger
 * @param {{path: string, text: string}} data
 * @param {boolean} strict
 */
function getConfig(c_ctx, logger, data, strict = false) {
  const { path, text: contents } = data;

  const _isTheme = Internal.isTheme(c_ctx, path);
  const paths = _isTheme ? c_ctx.theme_paths : c_ctx.site_paths;
  const include = _isTheme ? c_ctx.theme_include : c_ctx.site_include;

  const plugins = loadPlugin(c_ctx.plugins_list, paths, include, strict);
  warnningOfTryLoadErrors(logger);

  const entry = { path, contents };
  return Object.assign(c_ctx.theme_config, c_ctx.site_config, { entry, plugins });
}

module.exports = function (ctx) {
  checkHexoInit(ctx);
  const c_ctx = new ConfigContext(ctx);
  return {
    /**
     * @param {Hexo} ctx
     * @param {{path: string, text: string}} data
     * @param {boolean} strict
     */
    getConfig(data, strict = false) {
      return getConfig(c_ctx, ctx.log, data, strict);
    },
    /**
     * @param {string} path
     */
    isEntry: path => Internal.isEntry(c_ctx, path),
    /**
     * @param {string} path
     */
    isTheme: path => Internal.isTheme(c_ctx, path),
    /**
     * @param {string} path
     */
    isSite: path => Internal.isSite(c_ctx, path)
  };
};

module.exports.internal = { warnningOfTryLoadErrors, checkHexoInit };