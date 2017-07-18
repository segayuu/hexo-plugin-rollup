const { ok, throws, deepStrictEqual } = require("assert");
const tester = require("../lib/loadplugin");
const isCallable = require("is-callable");

describe('loadplugin', () => {
  describe('resolveArray', () => {
    const func = tester.resolveArray;
    it('関数である', () => {
      ok(isCallable(func));
    });
    it('正常系');
    it('空のとき', () => {
      const input = [];
      const result = func(input);
      deepStrictEqual(result, []);
    });
    it('数値のとき', () => {
      throws(() => {
        func(1);
      }, TypeError);
    });
    it('nullのとき', () => {
      throws(() => {
        func(null);
      }, TypeError);
    });
  });
  describe('tryLoad', () => {
    const func = tester.tryLoad;
    it('関数かどうか', () => {
      ok(isCallable(func));
    });
    it('正常系');
    it('見つからないとき');
    it('引数がstringじゃない');
  });
  describe('load', () => {
    const func = tester.load;
    it('関数かどうか', () => {
      ok(isCallable(func));
    });
    it('正常系');
    it('見つからないとき');
    it('引数がstringじゃない');
  });
});