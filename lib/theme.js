'use strict';
const { join, dirname } = require('path');
const { all_join, is, base_config } = require('./utility');

const theme = {
  js_dir: ctx => join(ctx.theme_dir, 'source', 'js'),
  dir: ctx => ctx.theme_dir,
  getRaw(ctx){
    const raw = ctx.theme.config.rollup;
    return is.object(raw) ? raw : {};
  },
  include(ctx){
    const { include: raw } = theme.getRaw(ctx);
    if (!is.object(raw)) {
      return {};
    }
    return all_join(theme.dir(ctx), raw);
  },
  loadConfig(ctx){
    return {
      include: theme.include(ctx),
      config: base_config(theme.getRaw(ctx), theme.js_dir(ctx)),
      paths: theme.js_dir(ctx)};
  },
  pathCheck(ctx, path){
    return dirname(path) === theme.js_dir(ctx);
  }
}

module.exports = theme;

module.exports.wrap = function(ctx){
  return {
    js_dir: () => theme.js_dir(ctx),
    dir: () => theme.dir(ctx),
    getRaw: () => theme.getRaw(ctx),
    include: () => theme.include(ctx),
    loadConfig: () => theme.loadConfig(ctx),
    pathCheck: path => theme.pathCheck(ctx, path)
  }
};