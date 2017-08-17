'use strict';
const { join, dirname } = require('path');
const isPlainObject = require("lodash/isPlainObject");
const { all_join, base_config } = require('./utility');

/**
 * @typedef {Object} Hexo
 */

/**
 * @typedef {Object} ThemeContext
 * @prop {string} dir
 * @prop {string} js_dir
 * @prop {object} raw
 * @prop {object} include
 * @prop {object} config
 */
/**
 * @class
 * @param {Hexo} ctx
 */
function ThemeContext(ctx) {
  this.dir = ctx.theme_dir;
  this.paths = this.js_dir = join(this.dir, 'source', 'js');
  this.raw = isPlainObject(ctx.theme.config.rollup) ? ctx.theme.config.rollup : {};
  this.include = isPlainObject(this.raw.include) ? all_join(this.dir, this.raw.include) : {};
  this.config = base_config(this.raw, this.js_dir);
}

ThemeContext.prototype.pathCheck = function (path) {
  return dirname(path) === this.js_dir;
}

module.exports = {
  loadConfig(ctx) {
    return new ThemeContext(ctx);
  },
  pathCheck(ctx, path) {
    return dirname(path) === join(ctx.theme_dir, 'source', 'js');
  }
};