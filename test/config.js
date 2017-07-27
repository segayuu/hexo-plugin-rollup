"use strict";

const { ok } = require("assert");
const isCallable = require("is-callable");
const isPromise = require("is-promise");
const isString = require("is-string");
const isPlainObject = require("is-plain-object");

const { test } = require("ava");

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

let hexo;
let configObj;
let load;

const validPath = `${__dirname}${sep}source${sep}js${sep}index.js`;

test.before(async () => {
  hexo = await HexoNewInstanceAsync(__dirname);
  configObj = configFunc(hexo);
  ({ loadConfig: load } = site.wrap(hexo));
});

test.beforeEach(() => {
  hexo.config.rollup = {};
});

test("entry undefined", t => {
  const { config } = load();
  t.true(isPlainObject(config));
  const { entry } = config;
  ok(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, []);
  ok(!configObj.isEntry(validPath));
});

test("entry string", t => {
  hexo.config.rollup.entry = "index.js";
  const { config } = load();
  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, [validPath]);
  t.true(configObj.isEntry(validPath));
});

test("entry array", t => {
  hexo.config.rollup.entry = ["index.js"];
  const { config } = load();
  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, [validPath]);
  t.true(configObj.isEntry(validPath));
});

test("entry empty", t => {
  hexo.config.rollup.entry = null;
  const { config } = load();
  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, []);
  t.true(!configObj.isEntry(validPath));
});
