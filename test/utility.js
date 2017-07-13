const { ok, equal, throws } = require("assert");
const { join: joinFn } = require("path");
const util = require("../lib/utility");
const isPlainObject = require("is-plain-object");
const isString = require("is-string");

describe('utility', () => {
    describe('all_join', () => {
        const func = util.all_join;
        it('safety', () => {
            const input1 = "es";
            const input2 = {
                "item1": "set",
                "item2": "set2"
            };
            const result = func(input1, input2);
            ok(isPlainObject(result));
            const { item1, item2 } = result;
            ok(isString(item1));
            ok(isString(item2));
            equal(item1, joinFn(input1, input2.item1));
            equal(item2, joinFn(input1, input2.item2));
        });

        it('throws', () => {
            const input1 = "es";
            const input2 = null;
            throws(() => {
                func(input1, null);
            });
        });
    });
});

