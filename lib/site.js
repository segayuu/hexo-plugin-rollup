'use strict';
const { join, dirname } = require('path');
const isPlainObject = require("lodash/isPlainObject");
const { all_join, base_config } = require('./utility');

const siteContext = function(ctx){
  this.dir = ctx.base_dir;
  this.paths = this.js_dir = join(ctx.source_dir, "js");
  let { rollup: raw = {} } = ctx.config;
  this.raw = raw = isPlainObject(raw) ? raw : {};
  const { include = {} } = raw;
  this.include = isPlainObject(include) ? all_join(this.dir, include) : {};
  this.config = base_config(raw, this.js_dir);
};

module.exports = {
  loadConfig(ctx){
    return new siteContext(ctx);
  },
  pathCheck(ctx, path){
    return dirname(path) === join(ctx.source_dir, "js");
  }
};