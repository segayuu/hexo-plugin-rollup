const { ok, throws, deepStrictEqual, strictEqual } = require("assert");
const tester = require("../lib/loadplugin");
const isCallable = require("is-callable");

describe('loadplugin', () => {
  const plugin_plefix = "rollup-plugin-";
  const validPluginName = "memory";
  const invalidPluginName = "hogemoge";
  describe('resolveArray', () => {
    const func = tester.resolveArray;
    it('関数である', () => {
      ok(isCallable(func));
    });
    it('正常系', () => {
      const func = tester.resolveArray;
      const input = ["a", "b", "c"];
      const result = func(input);
      deepStrictEqual(result, [{
        "name": "a",
        "config": {}
      },
      {
        "name": "b",
        "config": {}
      },{
        "name": "c",
        "config": {}
      }]);
    });
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
        tester.clearTryLoadErrors();
        const result = func(validPluginName);
        ok(isCallable(result));
        strictEqual(tester.tryLoadErrors.length, 0);
      });
      it('prefixあり', () => {
        tester.clearTryLoadErrors();
        const result = func(plugin_plefix + validPluginName);
        ok(isCallable(result));
        strictEqual(tester.tryLoadErrors.length, 0);
      });
    });
    describe('見つからないとき', () => {
      it('prefixなし', () => {
        tester.clearTryLoadErrors();
        const result = func(invalidPluginName);
        strictEqual(result, false);
        strictEqual(tester.tryLoadErrors.length, 1);
      });
      it('prefixあり', () => {
        tester.clearTryLoadErrors();
        const result = func(plugin_plefix + invalidPluginName);
        strictEqual(result, false);
        strictEqual(tester.tryLoadErrors.length, 1);
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
        const result = func(validPluginName);
        ok(isCallable(result));
      });
      it('prefixあり', () => {
        const result = func(plugin_plefix + validPluginName);
        ok(isCallable(result));
      });
    });
    describe('見つからないとき', () => {
      it('prefixなし', () => {
        throws(() => {
          func(invalidPluginName);
        }, err => (err instanceof Error && err.code === "MODULE_NOT_FOUND")
        );
      });
      it('prefixあり', () => {
        throws(() => {
          func(plugin_plefix + invalidPluginName);
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