'use strict';
/* global hexo */
/**
 * Created by tumugu2 on 2016/12/15.
 */
const { basename, dirname, join } = require('path');
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
    }

    const warningCallback = function(warn){
        hexo.log.warn('RollupRendererPlugin: %s', warn.message);
    }

    function renderer(data){
        const configObj = new HexoRollupConfig(hexo);
        const { path, text: contents } = data;

        const isTheme = dirname(path) === configObj.theme_js_dir;

        if (!configObj.isEntry(path)){
            return data.text;
        }

        const config = Object.assign(configObj.get(), {
            entry: { path, contents },
            plugins: isTheme ? config.theme_plugins : config.site_plugins
        });

        config.onwarn = warningCallback;

        return rollup(config).then(bundleCallback).catch(errorCallback);
    }
    return renderer;
}

hexo.extend.renderer.register('js', 'js', getRenderer(hexo), false);