'use strict';
const { join, dirname } = require('path');
const isPlainObject = require("lodash/isPlainObject");
const { all_join, base_config } = require('./utility');

const siteContext = function(ctx){
  this.dir = ctx.base_dir;
  this.paths = this.js_dir = join(ctx.source_dir, "js");
  this.raw = isPlainObject(ctx.config.rollup) ? ctx.config.rollup : {};
  this.include = isPlainObject(this.raw.include) ? all_join(this.dir, this.raw.include) : {};
  this.config = base_config(this.raw, this.js_dir);
};

module.exports = {
  loadConfig(ctx){
    return new siteContext(ctx);
  },
  pathCheck(ctx, path){
    return dirname(path) === join(ctx.source_dir, "js");
  }
};