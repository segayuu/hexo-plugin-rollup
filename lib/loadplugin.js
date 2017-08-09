'use strict';
const tryRequire = require("try-require");
const { includes, isPlainObject, isString, isFunction } = require("lodash");
const { isArray } = Array;

function setRollupPaths(plugins, paths = []) {
  const paths_name = "rollup-plugin-includepaths";
  const plugin_paths = plugins.find(i => i.name === paths_name);
  if (isPlainObject(plugin_paths) && isPlainObject(plugin_paths.config)) {
    plugin_paths.config.paths = paths;
  }
  return plugins;
}

function setRollupIncludeJsFiles(plugins, include = {}) {
  const paths_name = "rollup-plugin-includepaths";
  const plugin_paths = plugins.find(i => i.name === paths_name);
  if (isPlainObject(plugin_paths) && isPlainObject(plugin_paths.config)) {
    plugin_paths.config.include = include;
  }
  return plugins;
}

/**
 * plugin_nameからrollupのプラグインを探し、そのコンストラクタ関数を返します。
 * 見つからなかった場合、strictがfalseならfalseを返し、trueならthrowします。
 * @param {string} plugin_name
 * @param {boolean} strict
 * @return {function(object):object|false}
 */
function loadPlugin(plugin_name, strict = false) {
  if (!isString(plugin_name)) {
    throw new TypeError("plugin_name most string.");
  }
  plugin_name = checkIfPrefix(plugin_name);
  let plugin;
  if (strict) {
    plugin = require(plugin_name);
  } else {
    plugin = tryRequire(plugin_name);
    const lastError = tryRequire.lastError();
    if (lastError != null) {
      const msg = lastError.toString();
      if (!includes(loadPlugin.errors, msg)) {
        loadPlugin.errors.push(msg);
      }
      return false;
    }
  }
  if (!isFunction(plugin)) {
    throw new Error(`plugin "${plugin_name}" module not callable!`);
  }
  return plugin;
}

function clearTryLoadErrors() {
  loadPlugin.errors = [];
}

clearTryLoadErrors();

function checkIfPrefix(name) {
  const prefix = 'rollup-plugin-';
  return name.startsWith(prefix) ? name : prefix + name;
}

function createPluginInctance({ name, config }, strict) {
  if (!(isPlainObject(config) || null == config)) {
    throw new TypeError();
  }
  const plugin = loadPlugin(name, strict);
  return plugin ? plugin(config) : null;
}

const pkgObj = {
  /**
   * plugin_nameと同名のモジュールを検索し、プラグインのコンストラクタ関数を返します。
   * 見つからなかった場合、falseを返します。
   * @param {string} plugin_name
   * @return {function(object):object|false}
   */
  tryLoad(plugin_name) {
    return loadPlugin(plugin_name, false);
  },
  get tryLoadErrors() {
    return [...loadPlugin.errors];
  },
  clearTryLoadErrors,
  /**
   * plugin_nameと同名のモジュールを検索し、プラグインのコンストラクタ関数を返します。
   * 見つからなかった場合、Errorをthrowします。
   * @param {string} plugin_name
   * @throws {Error} モジュールが見つからなかったとき
   */
  load(plugin_name) {
    return loadPlugin(plugin_name, true);
  },
  /**
   * pluginsを元にpluginを生成して、それを要素とした配列を返します。
   * @param {{name: string, config: object}[]} plugins
   * @param {boolean} [strict] - pluginsがなかった場合、trueなら例外をthrowし、falseなら無視します。
   * @return {object[]}
   */
  create(plugins, strict = false) {
    if (!isArray(plugins)) {
      plugins = Array.from(plugins);
    }
    if (!plugins.every(i => isPlainObject(i) && isString(i.name) && isPlainObject(i.config))) {
      throw new TypeError('plugins most "{name: string, config: object}[]"');
    }

    return plugins.map(({ name, config }) => createPluginInctance({ name, config }, strict)).filter(i => i !== null);
  },
  /**
   * pluginsの型を正規化します。
   * @param {(string|{name: string, config: object})[]|string} plugins
   * @return {{name: string, config: object}[]}
   */
  resolveArray(plugins) {
    if (plugins == null) {
      throw new TypeError("required arguments!");
    }

    if (isString(plugins)) {
      plugins = [plugins];
    } else if (!isArray(plugins)) {
      throw new TypeError('plugins most "(string|{name: string, config: object})[]|string"');
    }
    const result = [];
    for (let plugin of plugins) {
      if (isString(plugin)) {
        plugin = { name: plugin, config: {} };
      } else if (!isPlainObject(plugin)) {
        throw new TypeError('plugins most "(string|{name: string, config: object})[]|string"');
      } else if (null == plugin.config) {
        plugin.config = {};
      }
      result.push(plugin);
    }
    return result;
  },
  allLoad(plugins_list, paths = [], include = {}, strict = false){
    plugins_list = [...plugins_list, ...require('./plugins_config.json')];
    plugins_list = pkgObj.resolveArray(plugins_list);
    setRollupPaths(plugins_list, paths);
    setRollupIncludeJsFiles(plugins_list, include);
    return pkgObj.create(plugins_list, strict);
  }
};

/**
 * rollupプラグインに関わる関数群をまとめたネームスペースです。
 */
module.exports = pkgObj;