'use strict';
const { dirname, join } = require('path');
/**
 * @template T
 * @type {function(T[], T):boolean}
 */
const includes = require('array-includes');
const { resolveArray: pluginsResolve, create: pluginsCreate } = require("./loadplugin");
const { all_join, base_config, is } = require('./utility');

function checkHexoInit(hexo) {
    const { ok, notEqual } = require('assert');
    if (hexo == null) {
        throw new Error('required argument Hexo!');
    }
    ok(is.object(hexo.env));
    if (!hexo.env.init) {
        throw new Error("hexo object not init!");
    }
    notEqual(
        hexo.config,
        null,
        "hexo object init not resolve."
    );
}

function pluginPathConfig(plugins, config) {
    const paths_name = "rollup-plugin-includepaths";
    const plugin_paths = plugins.find(i => i.name === paths_name);
    if (plugin_paths) {
        plugin_paths.config = config;
    }
    return plugins;
}

class HexoRollupConfig {

    /**
     * @typedef {Object} HexoEnvironment
     * @property {object} args
     * @property {boolean} debug
     * @property {boolean} safe
     * @property {boolean} silent
     * @property {boolean} env
     * @property {string} version
     * @property {boolean} init
     */
    /**
     * @typedef {Object} HexoProcessor
     */
    /**
     * @typedef {Object} Box
     * @property {object} options
     * @property {object} context
     * @property {*} base
     * @property {HexoProcessor[]} processors
     * @property {EventEmitter} watcher
     * @property {object} Cache
     * @property {File} File
     * @property {function(object, function(object,File))} addProcessor
     * @property {function([function(Error,string[])]):Promise<string[]>} process
     * @property {function([function(Error)]):Promise} watch
     * @property {function()} unwatch
     * @property {boolean} inWatching
     */
    /**
     * @typedef {Box} HexoTheme
     * @property {object} config
     * @property {object} views
     * @property {object} i18n
     */
    /**
     * @typedef {Object} HexoLocalsManager
     */
    /**
     * @typedef {Object} HexoScaffold
     */
    /**
     * @typedef {Object} Database
     */
    /**
     * @typedef {Box} HexoSource 
     */
    /**
     * @typedef {Object} Hexo
     * @property {string} base_dir
     * @property {string} public_dir
     * @property {string} source_dir
     * @property {string} plugin_dir
     * @property {string} script_dir
     * @property {string} scaffold_dir
     * @property {string} theme_dir
     * @property {string} theme_script_dir
     * @property {string} config_path
     * @property {{root:string,url:string,theme:string}} config
     * @property {object} log
     * @property {object} render
     * @property {object} route
     * @property {HexoScaffold} scaffold
     * @property {Database} database
     * @property {HexoSource} source
     * @property {HexoLocalsManager} locals
     * @property {HexoTheme} theme
     * @property {HexoEnvironment} env
     */
    /**
     * @param {Hexo} hexo
     */
    constructor(hexo) {
        if (hexo == null) {
            throw new Error('required argument Hexo!');
        }
        this.hexo = hexo;
    }
    get site_js_dir() {
        checkHexoInit(this.hexo);
        return join(this.hexo.source_dir, 'js');
    }
    get theme_js_dir() {
        checkHexoInit(this.hexo);
        return join(this.hexo.theme_dir, 'source', 'js');
    }
    isTheme(path) {
        return dirname(path) === this.theme_js_dir;
    }
    isSite(path) {
        return !this.isTheme(path) && dirname(path) === this.site_js_dir;
    }
    /**
     * 
     */
    get plugins() {
        return pluginsResolve([...this.raw_site_config.plugins, ...require('./plugins_config.json')]);
    }
    /**
     * 
     * @param {string} path 
     */
    isEntry(path) {
        const isTheme = this.isTheme(path);
        const isSite = this.isSite(path);

        if (!isSite && !isTheme) {
            return false;
        }
        return includes(this._getEntrys(isTheme), path);
    }
    _getEntrys(pathOfTheme) {
        /**
         * @type {string[]}
         */
        return pathOfTheme ? this.theme_config.entry : this.site_config.entry;
    }
    /**
     * 
     */
    get raw_site_config() {
        const hexo = this.hexo;
        checkHexoInit(hexo);
        /**
         * @type {object}
         */
        const config = hexo.config.rollup;
        return is.object(config) ? config : {};
    }
    /**
     * 
     */
    get raw_theme_config() {
        const hexo = this.hexo;
        checkHexoInit(hexo);
        /**
         * @type {object}
         */
        const config = hexo.theme.config.rollup;
        return is.object(config) ? config : {};
    }
    get site_include() {
        const config = this.raw_site_config;
        /**
         * @type {object}
         */
        const include = config.include;
        if (!is.object(include)) {
            return {};
        }
        return all_join(this.hexo.base_dir, include);
    }
    get theme_include() {
        const config = this.raw_theme_config;
        /**
         * @type {object}
         */
        const include = config.include;
        if (!is.object(include)) {
            return {};
        }
        return all_join(this.hexo.theme_dir, include);
    }
    get site_config() {
        return base_config(this.raw_site_config, this.site_js_dir);
    }
    get theme_config() {
        return base_config(this.raw_theme_config, this.theme_js_dir);
    }
    _getPlugins(configInTheme) {
        let paths_config;

        if (configInTheme) {
            paths_config = {
                paths: this.theme_js_dir,
                include: this.theme_include
            };
        } else {
            paths_config = {
                paths: this.site_js_dir,
                include: this.site_include
            };
        }
        return pluginPathConfig(this.plugins, paths_config);
    }
    getConfig(data, strict = false) {
        const { path, text: contents } = data;
        const entry = { path, contents };
        const plugins = pluginsCreate(this._getPlugins(this.isTheme(path)), strict, this.hexo.log);
        return Object.assign(this.theme_config, this.site_config, { entry, plugins });
    }
}

module.exports = HexoRollupConfig;