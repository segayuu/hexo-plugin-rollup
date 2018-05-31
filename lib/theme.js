
const { join, dirname } = require('path');
const isPlainObject = require('lodash/isPlainObject');
const { all_join, base_config, checkHexoInit} = require('./utility');

/** @typedef {NodeJS.EventEmitter} Hexo */

/**
 * @constructor
 * @param {Hexo} ctx
 */
function ThemeContext(ctx) {
  this.dir = ctx.theme_dir;
  this.paths = this.js_dir = join(this.dir, 'source', 'js');
  this.raw = isPlainObject(ctx.theme.config.rollup) ? ctx.theme.config.rollup : {};
  this.include = isPlainObject(this.raw.include) ? all_join(this.dir, this.raw.include) : {};
  this.config = base_config(this.raw, this.js_dir);
}

ThemeContext.prototype.pathCheck = function(path) {
  return dirname(path) === this.js_dir;
};

module.exports = {
  loadConfig(ctx) {
    checkHexoInit(ctx);
    return new ThemeContext(ctx);
  },
  pathCheck(ctx, path) {
    return dirname(path) === join(ctx.theme_dir, 'source', 'js');
  }
};
