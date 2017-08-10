'use strict';
const { isArray } = Array;
const { join } = require('path');
const isPlainObject = require("lodash/isPlainObject");
const isString = require("lodash/isString");
const omit = require("lodash/omit");
const toPairs = require("lodash/toPairs");

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
    for (let [k, v] of toPairs(obj)) {
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
    const result = omit(config, ["include"]);
    result.entry = filterEntry(config.entry, js_dir);
    return result;
  }
};