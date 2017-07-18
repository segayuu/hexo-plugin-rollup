const { ok } = require("assert");
const isPlainObject = require("is-plain-object");
const isObject = require("is-obj");
const isCallable = require("is-callable");
const isPromise = require("is-promise");
const Hexo = require("hexo");

async function HexoNewInstanceAsync(cwd = process.cwd(), args = {}){
  args.silent = true;
  const hexo = new Hexo(cwd, args);
  ok(isObject(hexo) && !isPlainObject(hexo));
  ok(isCallable(hexo.init));
  const initTask = hexo.init();
  ok(isPromise(initTask))
  await initTask;
  ok(isCallable(hexo.load));
  const loadTask = hexo.load();
  ok(isPromise(loadTask))
  await loadTask;
  return hexo;
}

describe('結合テスト諸々？', () => {
  it ('default init', () => {
    return HexoNewInstanceAsync();
  })
});