// Quick Lab content and page smoke checks. Run: node quick/test-data.js
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const path = require("node:path");
const base = __dirname;
const html = fs.readFileSync(path.join(base, "index.html"), "utf8");
const dataCode = fs.readFileSync(path.join(base, "data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(dataCode, sandbox, { filename: "quick/data.js" });
const data = sandbox.window.QUICK_DATA;
assert.ok(Array.isArray(data) && data.length >= 50, "at least 50 verified items");
assert.equal(data.length, new Set(data.map(x => x.han)).size, "unique glyphs");
const rootKeys = new Set("ABCDEFGHIJKLMNOPQRSTUVWY");
for (const item of data) {
  assert.equal(Array.from(item.han).length, 1, "one Hanzi per item: " + item.han);
  assert.match(item.cangjie, /^[A-Y]{1,5}$/, "valid Cangjie: " + item.han);
  assert.match(item.code, /^[A-Y]{1,2}$/, "valid Quick: " + item.han);
  assert.equal(item.code, item.cangjie[0] + (item.cangjie.length > 1 ? item.cangjie.at(-1) : ""), "first-last derivation: " + item.han);
  for (const k of ["meaning", "group", "shape", "firstShape", "explain", "source"]) assert.ok(item[k], "missing " + k + " in " + item.han);
  for (const c of item.code) assert.ok(rootKeys.has(c), "unknown root " + c + " in " + item.han);
  assert.match(item.source, /^https:\/\//);
}
const expected = {早:"AJ", 晨:"AV", 我:"HI", 你:"OF", 好:"VD", 明:"AB", 日:"A", 水:"E", 女:"V", 話:"YR", 唔:"RR", 港:"EU"};
for (const [han, code] of Object.entries(expected)) {
  assert.equal(data.find(item => item.han === han)?.code, code, "known sample: " + han);
}
assert.match(html, /<script src="\.\/data\.js"><\/script>/, "dataset must be loaded before application script");
const inline = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
assert.ok(inline, "inline app script must exist");
new vm.Script(inline[1], { filename: "quick/index.html:inline" });
for (const id of ["glyph","meaning","slot0","slot1","keyboard","hintBox","feedback","next","check","modeReview"]) assert.match(html, new RegExp('id="'+id+'"'), "required UI: "+id);
assert.match(html, /q\.code\.length/, "allow one-key codes");
assert.match(html, /firstErrors/, "root-level error diagnosis");
console.log("Quick Lab checks passed:", data.length, "characters;", data.filter(x=>x.code.length===1).length, "one-key roots");
