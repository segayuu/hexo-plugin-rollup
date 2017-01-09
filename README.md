# hexo-plugin-rollup
hexo plugin es module bundler

## Install
```
$ npm install hexo-plugin-rollup --save
```

##Options
```yaml
rollup:
  entry: themes/my-theme/source/js/index.js
```
or
```yaml
rollup:
  entry:
    - themes/my-theme/source/js/index.js
    - themes/my-theme/source/js/lib.js
```