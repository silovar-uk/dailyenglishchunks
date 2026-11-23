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

// Minimal DOM smoke test: catch broken references that syntax checks miss.
const nodes = new Map();
function element(id) {
  if (!nodes.has(id)) {
    const classes = new Set();
    nodes.set(id, {
      id, textContent: "", innerHTML: "", value: "", disabled: false,
      style: {}, attributes: {}, handlers: {},
      classList: {
        add(name) { classes.add(name); },
        remove(name) { classes.delete(name); },
        toggle(name, enabled) {
          if (enabled) classes.add(name); else classes.delete(name);
        },
        contains(name) { return classes.has(name); }
      },
      addEventListener(name, fn) { this.handlers[name] = fn; },
      setAttribute(name, value) { this.attributes[name] = value; }
    });
  }
  return nodes.get(id);
}
const saved = new Map();
const context = vm.createContext({
  window: { QUICK_DATA: data },
  document: { getElementById: element, addEventListener() {} },
  localStorage: {
    getItem(k) { return saved.get(k) || null; },
    setItem(k, v) { saved.set(k, v); }
  },
  Date, console, confirm() { return true; }
});
vm.runInContext(inline[1], context, { filename: "quick/index.html:runtime" });
assert.equal(element("glyph").textContent, "早", "initial question appears");
vm.runInContext('append("A");append("J");check()', context);
assert.equal(element("status").textContent, "正解", "two-key answer works");
assert.match(element("feedback").innerHTML, /日 ＋ 十/, "visual breakdown appears");
vm.runInContext("next()", context);
assert.equal(element("glyph").textContent, "晨", "next question advances");
element("hint").onclick();
assert.ok(!element("hintBox").textContent.includes("undefined"), "hint must never show undefined");
vm.runInContext('append("A");append("M");check()', context);
assert.match(element("feedback").innerHTML, /末尾の字根を復習/, "wrong last key is diagnosed");
vm.runInContext("pos=6;render();", context);
assert.equal(element("glyph").textContent, "日");
assert.equal(element("slot1").classList.contains("hidden"), true, "single-key character uses one slot");
vm.runInContext('append("A");check()', context);
assert.equal(element("status").textContent, "正解", "single-key answer works");
assert.ok(!element("meaning").textContent.includes("undefined"), "missing Jyutping must be omitted");
assert.ok(saved.has("quick-lab-v1"), "progress is saved locally");

console.log("Quick Lab checks passed:", data.length, "characters;", data.filter(x=>x.code.length===1).length, "one-key roots");
