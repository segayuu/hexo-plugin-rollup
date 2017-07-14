'use strict';
/* global hexo */
/**
 * Created by tumugu2 on 2016/12/15.
 */
const { rollup } = require('rollup');
const HexoRollupConfig = require('./class_config');

const getRenderer = module.exports = function(hexo) {
    if (null == hexo) {
        throw new Error('required argument Hexo!');
    }

    const bundleCallback = function (bundle) {
        return bundle.generate({
            format: 'iife',
            moduleName: 'hexo_rollup'
        }).code;
    };

    const errorCallback = function (err) {
        hexo.log.error('RollupRendererPlugin: %s', err.message);
        throw new Error('RollupRenderer Error.');
    };

    const warningCallback = function (warn) {
        hexo.log.warn('RollupRendererPlugin: %s', warn.message);
    };

    const configObj = new HexoRollupConfig(hexo);

    function renderer(data) {
        const { path, text: contents } = data;
        if (!configObj.isEntry(path)) {
            return contents;
        }

        const config = configObj.getConfig(data);
        config.onwarn = warningCallback;

        return rollup(config).then(bundleCallback).catch(errorCallback);
    }
    return renderer;
}

hexo.extend.renderer.register('js', 'js', getRenderer(hexo), false);