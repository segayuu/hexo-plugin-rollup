'use strict';
const { join, dirname } = require('path');
const { all_join, is, base_config } = require('./utility');

const site = {
  dir: ctx => ctx.base_dir,
  js_dir: ctx => join(ctx.source_dir, 'js'),
  getRaw(ctx){
    const { rollup: raw = {} } = ctx.config;
    return is.plainObject(raw) ? raw : {};
  },
  include(ctx){
    const { include: raw = {} } = site.getRaw(ctx);
    return is.plainObject(raw) ? all_join(site.dir(ctx), raw) : {};
  },
  config: ctx => base_config(site.getRaw(ctx), site.js_dir(ctx)),
  loadConfig(ctx){
    return {
      include: site.include(ctx),
      config: site.config(ctx),
      paths: site.js_dir(ctx)
    };
  },
  pathCheck: (ctx, path) => dirname(path) === site.js_dir(ctx),
  wrap(ctx){
    return {
      js_dir: () => site.js_dir(ctx),
      dir: () => site.dir(ctx),
      getRaw: () => site.getRaw(ctx),
      include: () => site.include(ctx),
      loadConfig: () => site.loadConfig(ctx),
      pathCheck: path => site.pathCheck(ctx, path)
    }
  }
};

module.exports = site;