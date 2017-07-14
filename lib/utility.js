'use strict';
const { join } = require('path');

const is = {
  plainObject: require("is-plain-object"),
  object: require("is-obj"),
  string: require("is-string"),
  array: Array.isArray,
  callable: require("is-callable"),
};

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
  if (Array.isArray(entrys)) {
    return entrys.filter(is.string).map(entry => join(js_dir, entry));
  } else if (is.string(entrys)) {
    return [join(js_dir, entrys)];
  }
  return [];
}

module.exports = {
  is,

  /**
   * 
   * @param {string} path
   * @param {object} obj 
   * @return {[string, string]}
   */
  all_join(path, obj) {
    const result = {};
    for (let [k, v] of entries(obj)) {
      if (is.string(v)) {
        result[k] = join(path, v);
      }
    }
    return result;
  },

  /**
   * 
   * @param {object} config 
   * @param {string} js_dir
   * @return {object}
   */
  base_config(config, js_dir) {
    const result = Object.assign({}, config, {
      entry: filterEntry(config.entry, js_dir)
    });
    if (result.include) {
      delete result.include;
    }
    return result;
  }
};