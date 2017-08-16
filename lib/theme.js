'use strict';
const { join, dirname } = require('path');
const isPlainObject = require("lodash/isPlainObject");
const { all_join, base_config } = require('./utility');

const themeContext = function(ctx){
  this.dir = ctx.theme_dir;
  this.paths = this.js_dir = join(this.dir, 'source', 'js');
  this.raw = isPlainObject(ctx.theme.config.rollup) ? ctx.theme.config.rollup : {};
  this.include = isPlainObject(this.raw.include) ? all_join(this.dir, this.raw.include) : {};
  this.config = base_config(this.raw, this.js_dir);
};

module.exports = {
  loadConfig(ctx){
    return new themeContext(ctx);
  },
  pathCheck(ctx, path){
    return dirname(path) === join(ctx.theme_dir, 'source', 'js');
  }
};