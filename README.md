# hexo-plugin-rollup

hexo plugin es module bundler.

## Install

```sh
$ npm install hexo-plugin-rollup --save
```

## Options

### Entry

```yaml
# _config.yml
rollup:
  entry: index.js
```
or
```yaml
# _config.yml
rollup:
  entry:
    - index.js
    - lib.js
```

#### entry file root path

_config.yml in site directory: `hexo-site/source/js/`

_config.yml in theme directory: `hexo-site/themes/my-theme/source/js/`

### Plugin

Import `rollup` plugin installed in Site or Theme directory.

To configure plugins inside of a configuration file, use the `plugins` key, which contains a list of plugin names.

The `rollup-plugin-` prefix can be omitted from the plugin name.

```yaml
# _config.yml
rollup:
  plugins:
    - memory
    - includepaths
    - commonjs
    - name: node-resolve
      config:
        browser: true
    - name: rollup-plugin-buble
      config:
        ie: 11
        chrome: 58
        edge: 15
```

### include

Include `*.js` file in Site or Theme directory.