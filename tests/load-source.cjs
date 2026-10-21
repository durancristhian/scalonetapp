const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Execute the real TS/TSX source, replacing only external service boundaries.
module.exports = function sourceLoader(mocks) {
  const root = path.resolve(__dirname, "..");
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const requireSource = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (!name.startsWith(".") && !name.startsWith("@/")) return require(name);
      let target = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name);
      const relative = "@/" + path.relative(root, target).replace(/\.tsx?$/, "");
      if (Object.hasOwn(mocks, relative)) return mocks[relative];
      if (!path.extname(target)) target = [target + ".ts", target + ".tsx"].find(fs.existsSync);
      return load(target);
    };
    new Function("require", "module", "exports", "console", code)(requireSource, loaded, loaded.exports, mocks.console ?? console);
    return loaded.exports;
  }
  return file => load(path.resolve(root, file));
};
