'use strict';
const { isArray } = Array;
const { join } = require('path');
const isPlainObject = require("lodash/isPlainObject");
const isString = require("lodash/isString");
const mapValues = require("lodash/mapValues");
const pick = require("lodash/pick");
const pickBy = require("lodash/pickBy");
const { ok, notEqual } = require('assert');

/**
 *
 * @param {Hexo} ctx
 */
function checkHexoInit(ctx) {
  if (ctx == null) {
    throw new TypeError('required argument Hexo!');
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

/**
 *
 * @param {string[]} entry
 * @param {string} js_dir
 */
function filterEntry(entrys, js_dir) {
  const _join = entry => join(js_dir, entry);
  if (isArray(entrys)) {
    return entrys.filter(isString).map(_join);
  } else if (isString(entrys)) {
    return [_join(entrys)];
  }
  return [];
}

module.exports = {
  /**
   *
   * @param {string} path
   * @param {object} obj
   */
  all_join(path, obj) {
    if (!isString(path)) {
      throw TypeError('first argument "path" most string!');
    }
    if (obj == null) {
      return {};
    } else if (!isPlainObject(obj)){
      throw TypeError('second argument "obj" most plain object!');
    }
    return mapValues(pickBy(obj, isString), i => join(path, i));
  },

  /**
   *
   * @param {object} config
   * @param {string} js_dir
   */
  base_config(config, js_dir) {
    if (!isPlainObject(config)) {
      throw new TypeError('first argument "config" most plain object!');
    }
    const keys = Object.keys(config).filter(i => "include" !== i);
    const result = pick(config, keys);
    result.entry = filterEntry(config.entry, js_dir);
    return result;
  },
  checkHexoInit
};