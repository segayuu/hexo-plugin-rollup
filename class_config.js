'use strict';
const { basename, dirname, join } = require('path');
const { rollup } = require('rollup');

const r_memory = require('rollup-plugin-memory');
const r_paths = require('rollup-plugin-includepaths');
const r_cjs = require('rollup-plugin-commonjs');
const r_node = require('rollup-plugin-node-resolve');
const r_buble = require('rollup-plugin-buble');

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

function getRollupPlugins(paths, include, plugins){
    const rollup_plugins = [
        r_memory(),
        r_paths({ paths, include }),
        r_cjs(),
        r_node({ browser: true }),
        r_buble({
            ie:11, chrome:58, edge:15
        })
    ];

    for (let [p_name, p_value] of entries(plugins)){
        const plugin = tryLoadRollupPlugin(p_name);
        if (false !== plugin){
            rollup_plugins.push(plugin(p_value));
        }
    }

    return rollup_plugins;
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
            plugins: site_plugins = {},
            entry: site_entry = [],
            include: site_include = {}
        } = this.raw_site_config, {
            plugins: theme_plugins = {},
            entry: theme_entry = [],
            include: theme_include = {}        
        } = this.raw_theme_config;

        const site_js_dir = join(hexo.source_dir, 'js');
        const theme_js_dir = join(hexo.theme_dir, 'source', 'js');

        this.site_js_dir = site_js_dir;
        this.theme_js_dir = theme_js_dir;

        this.site_entry = wrapArray(site_entry).map(n => join(site_js_dir, n));
        this.theme_entry = wrapArray(theme_entry).map(n => join(theme_js_dir, n));

        this.site_include = all_join(hexo.base_dir, site_include);
        this.theme_include = all_join(hexo.theme_dir, theme_include);

        this.site_plugins = getRollupPlugins([ site_js_dir ], site_include, site_plugins);
        this.theme_plugins = getRollupPlugins([ theme_js_dir ], theme_include, theme_plugins);
    }
    isEntry(path){
        const isTheme = dirname(path) === this.theme_js_dir;
        const isSite = !isTheme && dirname(path) === this.site_js_dir;     

        console.log('this.site_entry:'+this.site_entry);
        console.log('this.theme_entry:'+this.theme_entry);

        if (!(isSite || isTheme)){
            return false;
        }
        console.log('indexof:'+(isSite ? this.site_entry : this.theme_entry).indexOf(path));
        return (isSite ? this.site_entry : this.theme_entry).indexOf(path) >= 0;
    }
    get(){
        const concat = Object.assign({}, this.raw_theme_config, this.raw_site_config);
        delete concat.include;

        return concat;
    }

}

module.exports = HexoRollupConfig;