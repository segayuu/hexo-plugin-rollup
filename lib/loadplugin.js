'use strict';
const { is } = require('./utility');

function warning(msg, logger) {
  if (logger != null && is.callable(logger.warn)) {
    logger.warn(msg);
  }
}

function tryLoadModule(module_name, strict = false, logger = null) {
  if (!is.string(module_name)) {
    throw new TypeError("module_name most string.");
  }
  try {
    return require(module_name);
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND' || strict) {
      throw e;
    }
    warning(`rollup plugin "${module_name}" NOT FOUND.`, logger);
    return false;
  }
}

/**
 * plugin_nameからrollupのプラグインを探し、そのコンストラクタ関数を返します。
 * 見つからなかった場合、strictがfalseならfalseを返し、trueならthrowします。
 * @param {string} plugin_name
 * @param {boolean} strict
 * @return {function(object):object|false}
 */
function loadPlugin(plugin_name, strict = false, logger = null) {
  if (!is.string(plugin_name)) {
    throw new TypeError("plugin_name most string.");
  }
  plugin_name = checkIfPrefix(plugin_name);
  const plugin = tryLoadModule(plugin_name, strict, logger);
  if (!is.callable(plugin)) {
    throw new Error(`plugin "${plugin_name}" module not callable!`);
  }
  return plugin;
}

function checkIfPrefix(name) {
  const prefix = 'rollup-plugin-';
  return name.startsWith(prefix) ? name : prefix + name;
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
  tryLoad(plugin_name, logger = null) {
    return loadPlugin(plugin_name, false, logger);
  },
  /**
   * plugin_nameと同名のモジュールを検索し、プラグインのコンストラクタ関数を返します。
   * 見つからなかった場合、Errorをthrowします。
   * @param {string} plugin_name
   * @throws {Error} モジュールが見つからなかったとき
   */
  load(plugin_name, logger = null) {
    return loadPlugin(plugin_name, true, logger);
  },
  /**
   * pluginsを元にpluginを生成して、それを要素とした配列を返します。
   * @param {{name: string, config: object}[]} plugins
   * @param {boolean} [strict] - pluginsがなかった場合、trueなら例外をthrowし、falseなら無視します。
   * @return {object[]}
   */
  create(plugins, strict = false, logger = null) {
    if (!is.array(plugins)) {
      plugins = Array.from(plugins);
    }
    if (!plugins.every(i => is.object(i))) {
      throw new TypeError();
    }

    return plugins.map(({ name, config }) => {
      if (!is.string(name) || !(is.object(config) || null == config)) {
        throw new TypeError();
      }
      const plugin = loadPlugin(name, strict, logger);
      return plugin ? plugin(config) : null;
    }).filter(i => i !== null);
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

    if (is.string(plugins)) {
      plugins = [ plugins ];
    } else if (!is.object(plugins)) {
      throw new TypeError('plugins most "(string|{name: string, config: object})[]|string"');
    }
    if (!is.array(plugins)) {
      plugins = Array.from(plugins);
    }
    plugins = plugins.map(i => is.string(i) ? { name: i, config: {} } : i);
    if (!plugins.every(v => is.plainObject(v))) {
      throw new TypeError('plugins most "(string|{name: string, config: object})[]|string"');
    }
    return plugins
      .filter(i => is.plainObject(i) && undefined !== i.name)
      .map(i => {
        if (!i.config) {
          i.config = {};
        }

        return i;
      });
  }
};