
const { isArray } = Array;
const tryRequire = require('try-require');
const includes = require('lodash/includes');
const isPlainObject = require('lodash/isPlainObject');
const isString = require('lodash/isString');
const isFunction = require('lodash/isFunction');
const compact = require('lodash/compact');
const intersection = require('lodash/intersection');

/* ---------------------------------------------------------*
 *          rollup include_paths plugin set configs        *
 *---------------------------------------------------------*/

function setRollupPaths(plugins, paths = []) {
  const paths_name = 'rollup-plugin-includepaths';
  const plugin_paths = plugins.find(i => i.name === paths_name);
  if (isPlainObject(plugin_paths) && isPlainObject(plugin_paths.config)) {
    plugin_paths.config.paths = paths;
  }
  return plugins;
}

function setRollupIncludeJsFiles(plugins, include = {}) {
  const paths_name = 'rollup-plugin-includepaths';
  const plugin_paths = plugins.find(i => i.name === paths_name);
  if (isPlainObject(plugin_paths) && isPlainObject(plugin_paths.config)) {
    plugin_paths.config.include = include;
  }
  return plugins;
}

/* ---------------------------------------------------------*
 *                   load plugins                          *
 *---------------------------------------------------------*/

function loadModule(name, strict) {
  if (strict) {
    return require(name);
  }
  const _module = tryRequire(name);
  const lastError = tryRequire.lastError();
  if (lastError != null) {
    setTryErrors(lastError);
    return false;
  }
  return _module;
}

function setTryErrors(err) {
  const errors = loadPlugin.errors;
  const msg = err.toString();
  if (!includes(errors, msg)) {
    errors[errors.length] = msg;
  }
}

/**
 * plugin_nameからrollupのプラグインを探し、そのコンストラクタ関数を返します。
 * 見つからなかった場合、strictがfalseならfalseを返し、trueならthrowします。
 * @param {string} name
 * @param {boolean} strict
 * @return {function(object):object|false}
 */
function loadPlugin(name, strict = false) {
  if (!isString(name)) {
    throw new TypeError('name most string.');
  }
  const plugin_name = checkIfPrefix(name);
  const plugin = loadModule(plugin_name, strict);
  if (plugin !== false && !isFunction(plugin)) {
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

function tryLoad(plugin_name) {
  return loadPlugin(plugin_name, false);
}

function load(plugin_name) {
  return loadPlugin(plugin_name, true);
}

/* ---------------------------------------------------------*
 *           plugin object create and set config           *
 *---------------------------------------------------------*/

function createPluginInctance({ name, config }, strict = false) {
  if (!(isPlainObject(config) || config == null)) {
    throw new TypeError();
  }
  const plugin = loadPlugin(name, strict);
  return plugin ? plugin(config) : null;
}

function create(plugins, strict = false) {
  if (!isArray(plugins)) {
    plugins = Array.from(plugins);
  }
  if (!plugins.every(i => isPlainObject(i) && isString(i.name) && isPlainObject(i.config))) {
    throw new TypeError('plugins most "{name: string, config: object}[]"');
  }
  const create = i => createPluginInctance(i, strict);
  const hasField = i => intersection(Object.keys(i), [
    'name',
    'options',
    'load',
    'resolveId',
    'transform',
    'transformBundle',
    'ongenerate',
    'onwrite',
    'intro',
    'outro',
    'banner',
    'footer'
  ]).length !== 0;

  return compact(plugins.map(create)).filter(hasField);
}

function resolveArray(plugins) {
  if (plugins == null) {
    throw new TypeError('required arguments!');
  }

  if (isString(plugins)) {
    plugins = [plugins];
  } else if (!isArray(plugins)) {
    throw new TypeError('plugins most "(string|{name: string, config: object?})[]|string"');
  }

  const len = plugins.length;
  const result = new Array(len);

  for (let i = 0; i < len; i++) {
    let plugin = plugins[i];
    if (isString(plugin)) {
      plugin = { name: plugin, config: {} };
    } else if (!isPlainObject(plugin)) {
      throw new TypeError('plugins most "(string|{name: string, config: object?})[]|string"');
    } else {
      plugin.config = plugin.config != null ? plugin.config : {};
    }
    result[i] = plugin;
  }

  return result;
}

/**
 * rollupプラグインに関わる関数群をまとめたネームスペースです。
 */
module.exports = {

  /**
   * plugin_nameと同名のモジュールを検索し、プラグインのコンストラクタ関数を返します。
   * 見つからなかった場合、falseを返します。
   * @param {string} plugin_name
   * @return {function(object):object|false}
   */
  tryLoad,

  /**
   * tryLoad
   */
  get tryLoadErrors() {
    return [...loadPlugin.errors];
  },

  /**
   *
   */
  clearTryLoadErrors,

  /**
   * plugin_nameと同名のモジュールを検索し、プラグインのコンストラクタ関数を返します。
   * 見つからなかった場合、Errorをthrowします。
   * @param {string} plugin_name
   * @throws {Error} モジュールが見つからなかったとき
   */
  load,

  /**
   * pluginsを元にpluginを生成して、それを要素とした配列を返します。
   * @param {{name: string, config: object}[]} plugins
   * @param {boolean} [strict] - pluginsがなかった場合、trueなら例外をthrowし、falseなら無視します。
   * @return {object[]}
   */
  create,

  /**
   * pluginsの型を正規化します。
   * @param {(string|{name: string, config: object})[]|string} plugins
   * @return {{name: string, config: object}[]}
   */
  resolveArray,
  allLoad(plugins_list, paths = [], include = {}, strict = false) {
    plugins_list = [...plugins_list, ...require('./plugins_config.json')];
    plugins_list = resolveArray(plugins_list);
    setRollupPaths(plugins_list, paths);
    setRollupIncludeJsFiles(plugins_list, include);
    return create(plugins_list, strict);
  }
};
