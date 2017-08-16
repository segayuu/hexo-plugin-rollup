'use strict';
const { isArray } = Array;
const { includes, isPlainObject } = require('lodash');
const { tryLoadErrors, allLoad: loadPlugin } = require("./loadplugin");
const theme = require("./theme");
const site = require("./site");

const configContext = function(ctx){
  const c_site = site.loadConfig(ctx);
  const c_theme = theme.loadConfig(ctx);
  this.site_config = isPlainObject(c_site.config) ? c_site.config : {};
  this.theme_config = isPlainObject(c_theme.config) ? c_theme.config : {};
  this.site_paths = isArray(c_site.paths) ? c_site.paths : [];
  this.theme_paths = isArray(c_theme.paths) ? c_theme.paths : [];
  this.site_include = isPlainObject(c_site.include) ? c_site.include : {};
  this.theme_include = isPlainObject(c_theme.include) ? c_theme.include : {};
  this.plugins_list = isArray(this.site_config.plugins) ? this.site_config.plugins : [];
};

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

function isTheme(ctx, path) {
  return theme.pathCheck(ctx, path);
}
function isSite(ctx, path) {
  return !isTheme(ctx, path) && site.pathCheck(ctx, path);
}

/**
 * @param {Hexo} ctx
 * @param {string} path
 */
function isEntry(ctx, path) {
  const _isTheme = isTheme(ctx, path);
  const _isSite = isSite(ctx, path);

  if (!_isSite && !_isTheme) {
    return false;
  }

  const { entry } = (_isTheme ? theme : site).loadConfig(ctx).config;
  return includes(entry, path);
}

function warnningOfTryLoadErrors(logger){
  for (let msg of tryLoadErrors) {
    logger.warn(msg);
  }
}
/**
 *
 * @param {Hexo} ctx
 * @param {{path: string, text: string}} data
 * @param {boolean} strict
 */
function getConfig(ctx, data, strict = false) {
  checkHexoInit(ctx);

  const { path, text: contents } = data;
  const c_ctx = new configContext(ctx);

  const _isTheme = isTheme(ctx, path);
  const paths = _isTheme ? c_ctx.theme_paths : c_ctx.site_paths;
  const include = _isTheme ? c_ctx.theme_include : c_ctx.site_include;

  const plugins = loadPlugin(c_ctx.plugins_list, paths, include, strict);

  warnningOfTryLoadErrors(ctx.log);

  const entry = { path, contents };
  return Object.assign(c_ctx.theme_config, c_ctx.site_config, { entry, plugins });
}

module.exports = function (ctx) {
  return {
    /**
     * @param {Hexo} ctx
     * @param {{path: string, text: string}} data
     * @param {boolean} strict
     */
    getConfig: (data, strict = false) => getConfig(ctx, data, strict),
    /**
     * @param {string} path
     */
    isEntry: path => isEntry(ctx, path),
    /**
     * @param {string} path
     */
    isTheme: path => isTheme(ctx, path),
    /**
     * @param {string} path
     */
    isSite: path => isSite(ctx, path)
  };
};

module.exports.internal = { loadPlugin, warnningOfTryLoadErrors, checkHexoInit };