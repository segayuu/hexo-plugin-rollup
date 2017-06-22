'use strict';
const { basename, dirname, join } = require('path');

function* entries(obj){
    for (let key of Object.keys(obj)){
        yield [key, obj[key]];
    }
}

function all_join(path, obj){
    const result = {};
    for (let [k, v] of entries(obj)){
        result[k] = join(path, v);
    }
    return result;
}

function wrapArray(item){
    return Array.isArray(item) ? item : [ item ];
}

function tryLoadRollupPlugin(plugin_name){
    if (!plugin_name.startsWith('rollup-plugin-')){
        return false;
    }
    try {
        return require(plugin_name);
    } catch (e) {
        if (!e.code || e.code !== 'MODULE_NOT_FOUND'){
            throw e;
        }
        return false;
    }
}

function getRollupPlugins(plugins){
    const _plugins = [];

    for (let [p_name, p_value] of entries(plugins)){
        const plugin = tryLoadRollupPlugin(p_name);
        if (false !== plugin){
            _plugins.push(plugin(p_value));
        }
    }

    return _plugins;
}

class HexoRollupConfig {
    constructor(hexo){
        if (!hexo) {
            throw new Error('required argument Hexo!');
        }        

        if (!hexo.config || !hexo.theme || !hexo.theme.config){
            throw new Error("hexo object not init!");
        }
        this.raw_site_config = hexo.config.rollup ? hexo.config.rollup : {};
        this.raw_theme_config = hexo.theme.config.rollup ? hexo.theme.config.rollup: {};

        this.init(hexo);
    }
    init(hexo){
        const {
            plugins = {},
            entry: site_entry = [],
            include: site_include = {}
        } = this.raw_site_config, {
            plugins: theme_plugins = {},
            entry: theme_entry = []      
        } = this.raw_theme_config;

        const site_js_dir = this.site_js_dir = join(hexo.source_dir, 'js');
        const theme_js_dir = this.theme_js_dir = join(hexo.theme_dir, 'source', 'js');

        this.site_entry = wrapArray(site_entry).map(n => join(site_js_dir, n));
        this.theme_entry = wrapArray(theme_entry).map(n => join(theme_js_dir, n));

        this.site_include = all_join(hexo.base_dir, site_include);
        this.theme_include = all_join(hexo.theme_dir, theme_include);

        this.plugins = Object.assign({
            'rollup-plugin-memory': {},
            'rollup-plugin-includepaths': {},
            'rollup-plugin-commonjs': {},
            'rollup-plugin-node-resolve': { browser: true },
            'rollup-plugin-buble': {
                ie:11, chrome:58, edge:15
            }
        }, plugins);
    }
    isEntry(path){
        const isTheme = dirname(path) === this.theme_js_dir;
        const isSite = !isTheme && dirname(path) === this.site_js_dir;     

        if (!isSite && !isTheme){
            return false;
        }
        const entrys = isSite ? this.site_entry : this.theme_entry;
        return entrys.indexOf(path) >= 0;
    }
    get(){
        const concat = Object.assign({}, this.raw_theme_config, this.raw_site_config);
        delete concat.include;

        return concat;
    }
    getConfig(data){
        const { path, text: contents } = data;
        const entry = { path, contents };

        if (dirname(path) === this.theme_js_dir){
            const paths = this.theme_js_dir;
            const include = this.theme_include;
        } else {
            const paths = this.site_js_dir;
            const include = this.site_include;
        }

        let plugins = Object.assign({}, this.plugins);
        plugins['rollup-plugin-includepaths'] = { paths, include };
        plugins = getRollupPlugins(plugins);

        return Object.assign(this.get(), { entry, plugins });
    }
}

module.exports = HexoRollupConfig;