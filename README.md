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
    # site _config.yml
    # hexo-site/source/js/
    # theme _config.yml
    # hexo-site/themes/my-theme/source/js/
    - index.js
    - lib.js
```