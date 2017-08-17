"use strict";
const { isArray } = Array;
const isPlainObject = require('lodash/isPlainObject');
const includes = require("lodash/includes");
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
  const { config } = _isTheme ? m_ctx.theme : m_ctx.site;
  const { entry = [] } = config;
  return includes(entry, path);
}

module.exports.ConfigContext = ConfigContext;
module.exports.isTheme = isTheme;
module.exports.isSite = isSite;
module.exports.isEntry = isEntry;