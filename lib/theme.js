'use strict';
const { join, dirname } = require('path');
const isPlainObject = require("lodash/isPlainObject");
const { all_join, base_config } = require('./utility');

const themeContext = function(ctx){
  this.dir = ctx.theme_dir;
  this.paths = this.js_dir = join(this.dir, 'source', 'js');
  const { rollup: raw = {} } = ctx.theme.config;
  this.raw = isPlainObject(raw) ? raw : {};
  const { include = {} } = this.raw;
  this.include = isPlainObject(include) ? all_join(this.dir, include) : {};
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