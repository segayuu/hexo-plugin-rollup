"use strict";
const isPlainObject = require("is-plain-object");

const { test } = require("ava");

const { dirname, join } = require("path");
const Hexo = require("hexo");
const validPath = join(dirname(__dirname), "source", "js", "index.js");

let hexo;
let configObj;
let load;

test.before(async t => {
  hexo = new Hexo(process.cwd(), { silent: true });

  const initTask = hexo.init();
  await initTask;

  //call load() only initTask after.
  //
  const loadTask = hexo.load();
  await loadTask;

  configObj = require("../lib/config")(hexo);
  load = require("../lib/site").wrap(hexo).loadConfig;
});

test.beforeEach(t => {
  hexo.config.rollup = {};
});

test("entry undefined", t => {
  const { config } = load();
  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, []);
  t.false(configObj.isEntry(validPath));
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
  t.false(configObj.isEntry(validPath));
});
