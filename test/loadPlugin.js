"use strict";

const { test } = require("ava");
const isCallable = require("is-callable");
const isString = require("is-string");

const tester = require("../lib/loadplugin");

const plugin_plefix = "rollup-plugin-";
const validPluginName = "memory";
const invalidPluginName = "hogemoge";

test.before("resolveArray is function", t => {
  t.true(isCallable(tester.resolveArray));
});

test("resolveArray 正常系", t => {
  const func = tester.resolveArray;
  const input = ["a", "b", "c"];
  const result = func(input);
  const expected = [{
    "name": "a",
    "config": {}
  },
  {
    "name": "b",
    "config": {}
  }, {
    "name": "c",
    "config": {}
  }];
  t.deepEqual(result, expected);
});

test("resolveArray 引数が空の配列のときは空を返す", t => {
  const func = tester.resolveArray;
  const input = [];
  const result = func(input);
  const expected = [];
  t.deepEqual(result, expected);
});

test("resolveArray 引数が配列以外のときはTypeErrorをthrowする", t => {
  const func = tester.resolveArray;
  t.throws(() => { func(1); }, TypeError);
  t.throws(() => { func(null); }, TypeError);
});

test.before("tryLoad is function", t => {
  t.true(isCallable(tester.tryLoad));
});

test.before("load is function", t => {
  t.true(isCallable(tester.load));
});

test.beforeEach("call clearTryLoadErrors", t => {
  tester.clearTryLoadErrors();
});

test("tryLoad 正常系 prefixなし", t => {
  const func = tester.tryLoad;
  const result = func(validPluginName);
  t.true(isCallable(result));
  t.deepEqual(tester.tryLoadErrors, []);
});

test("tryLoad 正常系 prefixあり", t => {
  const func = tester.tryLoad;
  const result = func(plugin_plefix + validPluginName);
  t.true(isCallable(result));
  t.deepEqual(tester.tryLoadErrors, []);
});

test("tryLoad 見つからないとき prefixなし", t => {
  const func = tester.tryLoad;
  const result = func(invalidPluginName);
  t.false(result);
  t.deepEqual(tester.tryLoadErrors.length, 1);
  t.true(isString(tester.tryLoadErrors[0]));
});

test("tryLoad 見つからないとき prefixあり", t => {
  const func = tester.tryLoad;
  const result = func(plugin_plefix + invalidPluginName);
  t.false(result);
  t.deepEqual(tester.tryLoadErrors.length, 1);
  t.true(isString(tester.tryLoadErrors[0]));
});

test("tryLoad 引数がstringじゃない", t => {
  const func = tester.tryLoad;
  t.throws(() => { func(); }, TypeError);
  t.throws(() => { func(1); }, TypeError);
  t.throws(() => { func({}); }, TypeError);
});

test("load 正常系 prefixなし", t => {
  const func = tester.load;
  const result = func(validPluginName);
  t.true(isCallable(result));
});

test("load 正常系 prefixあり", t => {
  const func = tester.load;
  const result = func(plugin_plefix + validPluginName);
  t.true(isCallable(result));
});

test("load 見つからないとき prefixなし", t => {
  const func = tester.load;
  t.throws(() => {
    func(invalidPluginName);
  }, err => (err instanceof Error && err.code === "MODULE_NOT_FOUND"));
});

test("load 見つからないとき prefixあり", t => {
  const func = tester.load;
  t.throws(() => {
    func(plugin_plefix + invalidPluginName);
  }, err => (err instanceof Error && err.code === "MODULE_NOT_FOUND"));
});

test("load 引数がstringじゃない", t => {
  const func = tester.load;
  t.throws(() => { func(); }, TypeError);
  t.throws(() => { func(1); }, TypeError);
  t.throws(() => { func({}); }, TypeError);
});