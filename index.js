'use strict';
const rollup = require('rollup').rollup;
const p_prefix = 'rollup-plugin-';
const r_plugin = {
    npm: require(p_prefix + 'node-resolve'),
    cjs: require(p_prefix + 'commonjs'),
    multiEntry: require(p_prefix + 'multi-entry')
};

const path = require('path');

class hexoRollupRenderer {
    constructor(hexo) {
        this._hexo = hexo;
    }

    static isString(str){
        return typeof str === 'string';
    }

    static get rollupPlugins() {
        return [
            r_plugin.multiEntry(),
            r_plugin.npm({
                browser: true
            }),
            r_plugin.cjs()
        ]
    }

    /**
     * Convert config of the entry to array.
     * @returns {Array} entry collection
     */
    get entry() {
        const cwd = process.cwd();
        let entry = this.userConfig.entry;
        if (hexoRollupRenderer.isString(entry)) entry = Array.of(entry);
        if (!entry) return [];
        return entry.filter(n => n.indexOf('source') !== -1).map(n => path.join(cwd, n));
    }

    /**
     * hexo user config getter
     * @returns {Object}
     */
    get userConfig() {
        return Object.assign({},
            this._hexo.theme.config.rollup || {},
            this._hexo.config.rollup || {}
        );
    }

    /**
     * renderer register function getter
     * @returns {Function}
     */
    get renderer() {
        const self = this;
        return function(data){
            if (self.entry.length === 0) {
                return Promise.resolve(data.text);
            }
            const config = Object.assign({}, self.userConfig, {
                entry: data.path,
                plugins: hexoRollupRenderer.rollupPlugins
            });
            return rollup(config).then(bundle => bundle.generate({
                    format: 'iife',
                    moduleName: 'hexo_rollup'
                }).code);
        };
    }
}

/* globals hexo */
const classes = new hexoRollupRenderer(hexo);
hexo.extend.renderer.register('js', 'js', classes.renderer);