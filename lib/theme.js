'use strict';
const { join, dirname } = require('path');
const { isPlainObject } = require("lodash");
const { all_join, base_config } = require('./utility');

const theme = {
  dir: ctx => ctx.theme_dir,
  js_dir: ctx => join(theme.dir(ctx), 'source', 'js'),
  getRaw(ctx){
    const { rollup: raw = {} } = ctx.theme.config;
    return isPlainObject(raw) ? raw : {};
  },
  include(ctx){
    const { include: raw = {} } = theme.getRaw(ctx);
    return isPlainObject(raw) ? all_join(theme.dir(ctx), raw) : {};
  },
  loadConfig(ctx){
    return {
      include: theme.include(ctx),
      config: base_config(theme.getRaw(ctx), theme.js_dir(ctx)),
      paths: theme.js_dir(ctx)};
  },
  pathCheck: (ctx, path) => dirname(path) === theme.js_dir(ctx),
  wrap(ctx){
    return {
      js_dir: () => theme.js_dir(ctx),
      dir: () => theme.dir(ctx),
      getRaw: () => theme.getRaw(ctx),
      include: () => theme.include(ctx),
      loadConfig: () => theme.loadConfig(ctx),
      pathCheck: path => theme.pathCheck(ctx, path)
    }
  }
}

module.exports = theme;