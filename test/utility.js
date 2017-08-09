"use strict";

const { join: joinFn } = require("path");
const { test } = require("ava");
const { isFunction: isCallable, isPlainObject, isString } = require("lodash");
const util = require("../lib/utility");

test.before("all_join is function", t => {
  const func = util.all_join;
  t.true(isCallable(func));
});

test("all_join 正常系", t => {
  const func = util.all_join;
  const input1 = "es";
  const input2 = {
    "item1": "set",
    "item2": "set2"
  };
  const result = func(input1, input2);
  t.true(isPlainObject(result));
  const { item1, item2 } = result;
  t.true(isString(item1));
  t.true(isString(item2));
  t.deepEqual(item1, joinFn(input1, input2.item1));
  t.deepEqual(item2, joinFn(input1, input2.item2));
});

test("all_join throws TypeError", t => {
  const func = util.all_join;
  const input1 = "es";
  const input2 = null;
  t.throws(() => { func(input1, input2); }, TypeError);
});

