'use strict';
/* global hexo */
/**
 * Created by tumugu2 on 2016/12/15.
 */
hexo.extend.renderer.register('js', 'js', require("./renderer")(hexo), false);