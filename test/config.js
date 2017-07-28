"use strict";
const isPlainObject = require("is-plain-object");

const { test } = require("ava");

const Hexo = require("hexo");
const { join: pathJoin } = require("path");
const site = require("../lib/site");
const configFunc = require("../lib/config");

async function HexoNewInstanceAsync(cwd = process.cwd(), args = {}) {
  args.silent = true;
  const hexo = new Hexo(cwd, args);

  const initTask = hexo.init();
  await initTask;

  const loadTask = hexo.load();
  await loadTask;

  return hexo;
}

let hexo;
let configObj;
let load;

const validPath = pathJoin(__dirname, "source", "js", "index.js");

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
