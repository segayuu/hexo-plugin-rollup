"use strict";

const { ok, deepStrictEqual } = require("assert");
const isCallable = require("is-callable");
const isPromise = require("is-promise");
const isString = require("is-string");
const isPlainObject = require("is-plain-object");
const Hexo = require("hexo");
const { sep } = require("path");
const site = require("../lib/site");
const configFunc = require("../lib/config");

async function HexoNewInstanceAsync(cwd = process.cwd(), args = {}) {
  args.silent = true;
  const hexo = new Hexo(cwd, args);
  ok(isCallable(hexo.init));
  ok(isCallable(hexo.load));

  const initTask = hexo.init();
  ok(isPromise(initTask))
  await initTask;

  const loadTask = hexo.load();
  ok(isPromise(loadTask))
  await loadTask;

  ok(isString(hexo.base_dir));
  ok(isString(hexo.public_dir));
  ok(isString(hexo.source_dir));
  ok(isString(hexo.plugin_dir));
  ok(isString(hexo.script_dir));
  ok(isString(hexo.scaffold_dir));

  return hexo;
}

describe('結合テスト諸々？', () => {
  let hexo;
  let configObj;
  before(async () => {
    hexo = await HexoNewInstanceAsync(__dirname);
    configObj = configFunc(hexo);
  });
  describe('entry', () => {
    const validPath = `${__dirname}${sep}source${sep}js${sep}index.js`;
    const load = () => site.loadConfig(hexo);
    it('undefined', () => {
      const { config } = load();
      ok(isPlainObject(config));
      ok(Array.isArray(config.entry), `config.entry typeof ${typeof config.entry}`);
      deepStrictEqual(config.entry, []);
      ok(!configObj.isEntry(validPath));
    });
    it('string', () => {
      hexo.config.rollup = {
        entry: "index.js"
      };
      const { config } = load();
      ok(isPlainObject(config));
      ok(Array.isArray(config.entry), `config.entry typeof ${typeof config.entry}`);
      deepStrictEqual(config.entry, [validPath]);
      ok(configObj.isEntry(validPath));
    });
    it('array', () => {
      hexo.config.rollup.entry = ["index.js"];
      const { config } = load();
      ok(isPlainObject(config));
      ok(Array.isArray(config.entry), `config.entry typeof ${typeof config.entry}`);
      deepStrictEqual(config.entry, [validPath]);
      ok(configObj.isEntry(validPath));
    });
    it('empty', () => {
      hexo.config.rollup.entry = null;
      const { config } = load();
      ok(isPlainObject(config));
      ok(Array.isArray(config.entry), `config.entry typeof ${typeof config.entry}`);
      deepStrictEqual(config.entry, []);
      ok(!configObj.isEntry(validPath));
    });
  });
});