'use strict';
const { join } = require('path');
const blacklist = require("blacklist");
const { isPlainObject, isString } = require("lodash");
const { isArray } = Array;

/**
 *
 * @param {object} obj
 * @return {[string, *][]}
 */
function entries(obj) {
  return Object.keys(obj).map(key => [key, obj[key]]);
}

/**
 *
 * @param {string[]} entry
 * @param {string} js_dir
 */
function filterEntry(entrys, js_dir) {
  if (isArray(entrys)) {
    return entrys.filter(isString).map(entry => join(js_dir, entry));
  } else if (isString(entrys)) {
    return [join(js_dir, entrys)];
  }
  return [];
}

module.exports = {
  /**
   *
   * @param {string} path
   * @param {object} obj
   * @return {[string, string]}
   */
  all_join(path, obj) {
    const result = {};
    for (let [k, v] of entries(obj)) {
      if (isString(v)) {
        result[k] = join(path, v);
      }
    }
    return result;
  },

  /**
   *
   * @param {object} config
   * @param {string} js_dir
   */
  base_config(config, js_dir) {
    if (!isPlainObject(config)) {
      throw new TypeError();
    }
    const result = blacklist(config, "include");
    result.entry = filterEntry(config.entry, js_dir);
    return result;
  }
};