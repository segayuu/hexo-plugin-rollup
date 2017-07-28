"use strict";
const isPlainObject = require("is-plain-object");

const { test } = require("ava");

const validPath = require("path").join(__dirname, "source", "js", "index.js");

test.before(async t => {
  const cwd = process.cwd();
  const hexo = new (require("hexo"))(cwd, { silent: true });

  const initTask = hexo.init();
  await initTask;

  //call load() only initTask after.
  //
  const loadTask = hexo.load();
  await loadTask;
  t.context.hexo = hexo;
  t.context.configObj = require("../lib/config")(hexo);
  t.context.load = require("../lib/site").wrap(hexo).loadConfig;
});

test.beforeEach(t => {
  t.context.hexo.config.rollup = {};
});

test("entry undefined", t => {
  const ctx = t.context;
  const { config } = ctx.load();
  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, []);
  t.false(ctx.configObj.isEntry(validPath));
});

test("entry string", t => {
  const ctx = t.context;
  ctx.hexo.config.rollup.entry = "index.js";
  const { config } = ctx.load();
  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, [validPath]);
  t.true(ctx.configObj.isEntry(validPath));
});

test("entry array", t => {
  const ctx = t.context;
  ctx.hexo.config.rollup.entry = ["index.js"];
  const { config } = ctx.load();
  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, [validPath]);
  t.true(ctx.configObj.isEntry(validPath));
});

test("entry empty", t => {
  const ctx = t.context;
  ctx.hexo.config.rollup.entry = null;
  const { config } = ctx.load();
  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, []);
  t.false(ctx.configObj.isEntry(validPath));
});
