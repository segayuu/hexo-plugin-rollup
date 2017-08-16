"use strict";
const Hexo = require("hexo");
const renderer = require("../lib/renderer");
const { test } = require("ava");

let hexo;
let render;

test.before(async t => {
  hexo = new Hexo(process.cwd(), { silent: true });
  hexo.config.rollup = {};

  const initTask = hexo.init();
  await initTask;

  t.true(hexo.env.init);

  //call load() only initTask after.
  //
  const loadTask = hexo.load();
  await loadTask;

  render = renderer(hexo);
});

test.beforeEach(t => {
  hexo.config.rollup = {};
})

test("empty config", async t => {
  const text = await render({path: "", text: ""});
  t.deepEqual(text, "");
});