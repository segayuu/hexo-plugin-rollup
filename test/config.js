"use strict";
const { isPlainObject } = require("lodash");

const { test } = require("ava");

const { dirname, join } = require("path");
const Hexo = require("hexo");
const validPath = join(dirname(__dirname), "source", "js", "index.js");

const hexo = new Hexo(process.cwd(), { silent: true });
const createConfigObject = require("../lib/config");
const getConfigObject = () => createConfigObject(hexo);
const createSiteConfig = require("../lib/site").loadConfig;
const load = () => createSiteConfig(hexo);

test.before(t => {
  t.throws(getConfigObject, Error, "hexo object not init!");
  t.throws(load, Error, "hexo object not init!");
});

test.before(async t => {
  const initTask = hexo.init();
  await initTask;

  //call load() only initTask after.
  //
  const loadTask = hexo.load();
  await loadTask;

  t.true(hexo.env.init, "hexo object not init!");
});

test.beforeEach(t => {
  hexo.config.rollup = {};
});

test("entry undefined", t => {
  const { config } = load();
  const configObj = getConfigObject();

  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, []);
  t.false(configObj.isEntry(validPath));
});

test("entry string", t => {
  hexo.config.rollup.entry = "index.js";

  const { config } = load();
  const configObj = getConfigObject();

  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, [validPath]);
  t.true(configObj.isSite(validPath));
  t.true(configObj.isEntry(validPath));
});

test("entry array", t => {
  hexo.config.rollup.entry = ["index.js"];

  const { config } = load();
  const configObj = getConfigObject();

  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, [validPath]);
  t.true(configObj.isSite(validPath));
  t.true(configObj.isEntry(validPath));
});

test("entry empty", t => {
  hexo.config.rollup.entry = null;
  const { config } = load();
  const configObj = getConfigObject();

  t.true(isPlainObject(config));
  const { entry } = config;
  t.true(Array.isArray(entry), `entry typeof ${typeof entry}`);
  t.deepEqual(entry, []);
  t.false(configObj.isEntry(validPath));
});
