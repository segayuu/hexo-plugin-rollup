"use strict";
const Hexo = require("hexo");
const renderer = require("../lib/renderer");
const { test } = require("ava");

let hexo;
let render;

test.before(async () => {
  hexo = new Hexo(process.cwd(), { silent: true });
  render = renderer(hexo);

  hexo.config.rollup = {};

  const initTask = hexo.init();
  await initTask;

  //call load() only initTask after.
  //
  const loadTask = hexo.load();
  await loadTask;
});

test.beforeEach(t => {
  hexo.config.rollup = {};
})

test("empty config", async t => {
  const text = await render({path: "", text: ""});
  t.deepEqual(text, "");
});