const { ok, throws, deepStrictEqual, strictEqual } = require("assert");
const tester = require("../lib/loadplugin");
const isCallable = require("is-callable");

describe('loadplugin', () => {
  const installedPrefixPluginName = "rollup-plugin-memory";
  const notInstalledPrefixPluginName = "rollup-plugin-hogemoge";
  const installedPluginName = "memory";
  const notInstalledPluginName = "hogemoge";
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
    describe('正常系', () => {
      it('prefixなし', () => {
        const result = func(installedPluginName);
        ok(isCallable(result));
      });
      it('prefixあり', () => {
        const result = func(installedPrefixPluginName);
        ok(isCallable(result));
      });
    });
    describe('見つからないとき', () => {
      it('prefixなし', () => {
        const result = func(notInstalledPluginName);
        strictEqual(result, false);
      });
      it('prefixあり', () => {
        const result = func(notInstalledPrefixPluginName);
        strictEqual(result, false);
      });
    });
    it('引数がstringじゃない', () => {
      throws(() => {
        func();
      }, TypeError);
      throws(() => {
        func(1);
      }, TypeError);
      throws(() => {
        func({});
      }, TypeError);
    });
  });
  describe('load', () => {
    const func = tester.load;
    it('関数かどうか', () => {
      ok(isCallable(func));
    });
    describe('正常系', () => {
      it('prefixなし', () => {
        const result = func(installedPluginName);
        ok(isCallable(result));
      });
      it('prefixあり', () => {
        const result = func(installedPrefixPluginName);
        ok(isCallable(result));
      });
    });
    describe('見つからないとき', () => {
      it('prefixなし', () => {
        throws(() => {
          func(notInstalledPluginName);
        }, err => (err instanceof Error && err.code === "MODULE_NOT_FOUND")
        );
      });
      it('prefixあり', () => {
        throws(() => {
          func(notInstalledPrefixPluginName);
        }, err => (err instanceof Error && err.code === "MODULE_NOT_FOUND")
        );
      });
    });
    it('引数がstringじゃない', () => {
      throws(() => {
        func();
      }, TypeError);
      throws(() => {
        func(1);
      }, TypeError);
      throws(() => {
        func({});
      }, TypeError);
    });
  });
});