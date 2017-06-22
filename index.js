'use strict';
/* global hexo */
/**
 * Created by tumugu2 on 2016/12/15.
 */
const { basename, dirname, join } = require('path');
const { rollup } = require('rollup');
const HexoRollupConfig = require('./class_config');

function getRenderer(hexo){
    if (undefined === hexo) {
        throw new Error('required argument Hexo!');
    }

    const bundleCallback = function(bundle){
        return bundle.generate({
            format: 'iife',
            moduleName: 'hexo_rollup'
        }).code;
    };

    const errorCallback = function(err){
        hexo.log.error('RollupRendererPlugin: %s', err.message);
        throw new Error('RollupRenderer Error.');        
    };

    const warningCallback = function(warn){
        hexo.log.warn('RollupRendererPlugin: %s', warn.message);
    };

    function renderer(data){
        const configObj = new HexoRollupConfig(hexo);
        const { path, text: contents } = data;

        if (!configObj.isEntry(path)){
            return contents;
        }

        const config = configObj.getConfig(data, configObj);

        config.onwarn = warningCallback;

        return rollup(config).then(bundleCallback).catch(errorCallback);
    }
    return renderer;
}

hexo.extend.renderer.register('js', 'js', getRenderer(hexo), false);