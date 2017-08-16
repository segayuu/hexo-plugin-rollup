'use strict';
const { isArray } = Array;
const { includes, isPlainObject } = require('lodash');
const { tryLoadErrors, allLoad: loadPlugin } = require("./loadplugin");
const theme = require("./theme");
const site = require("./site");

/**
 * @typedef {Object} Hexo
 */

/**
 *
 * @class
 * @param {Hexo} ctx
 */
function ConfigContext(ctx) {
  const c_site = site.loadConfig(ctx);
  const c_theme = theme.loadConfig(ctx);

  this.modeContext = {
    site: c_site,
    theme: c_theme
  };

  this.site_config = isPlainObject(c_site.config) ? c_site.config : {};
  this.theme_config = isPlainObject(c_theme.config) ? c_theme.config : {};
  this.site_paths = isArray(c_site.paths) ? c_site.paths : [];
  this.theme_paths = isArray(c_theme.paths) ? c_theme.paths : [];
  this.site_include = isPlainObject(c_site.include) ? c_site.include : {};
  this.theme_include = isPlainObject(c_theme.include) ? c_theme.include : {};
  this.plugins_list = isArray(this.site_config.plugins) ? this.site_config.plugins : [];
}

/**
 *
 * @param {Hexo} ctx
 */
function checkHexoInit(ctx) {
  const { ok, notEqual } = require('assert');
  if (ctx == null) {
    throw new Error('required argument Hexo!');
  }
  ok(isPlainObject(ctx.env));
  if (!ctx.env.init) {
    throw new Error("hexo object not init!");
  }
  notEqual(
    ctx.config,
    null,
    "hexo object init not resolve."
  );
}

/**
 *
 * @param {ConfigContext} c_ctx
 * @param {string} path
 */
function isTheme(c_ctx, path) {
  return c_ctx.modeContext.theme.pathCheck(path);
}


/**
 *
 * @param {ConfigContext} c_ctx
 * @param {string} path
 */
function isSite(c_ctx, path) {
  return !isTheme(c_ctx, path) && c_ctx.modeContext.site.pathCheck(path);
}

/**
 * @param {ConfigContext} c_ctx
 * @param {string} path
 */
function isEntry(c_ctx, path) {
  const _isTheme = isTheme(c_ctx, path);
  const _isSite = isSite(c_ctx, path);

  if (!_isSite && !_isTheme) {
    return false;
  }

  const m_ctx = c_ctx.modeContext;
  const { entry } = (_isTheme ? m_ctx.theme : m_ctx.site).config;
  return includes(entry, path);
}

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

  const _isTheme = isTheme(c_ctx, path);
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
    isEntry: path => isEntry(c_ctx, path),
    /**
     * @param {string} path
     */
    isTheme: path => isTheme(c_ctx, path),
    /**
     * @param {string} path
     */
    isSite: path => isSite(c_ctx, path)
  };
};

module.exports.internal = { loadPlugin, warnningOfTryLoadErrors, checkHexoInit };