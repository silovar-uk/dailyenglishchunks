/* Quick Lab compatibility entrypoint. Run: node quick/test-data.js
 * GitHub Actions uses this command; keep it stable while the curriculum grows.
 * Node.js 22+; no dependencies outside the standard library.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const base = __dirname;
const read = name => fs.readFileSync(path.join(base, name), "utf8");
const html = read("index.html");
const phraseHtml = read("phrases.html");

const context = vm.createContext({ window: {} });
for (const name of ["data.js", "extras.js", "trivia.js"]) {
  vm.runInContext(read(name), context, { filename: name });
}
const data = context.window.QUICK_DATA;
const extras = context.window.QUICK_EXTRAS;
const trivia = context.window.QUICK_TRIVIA;
assert.ok(Array.isArray(data), "character data must load");
assert.ok(Array.isArray(trivia), "trivia data must load");
assert.equal(Object.keys(extras).length, data.length, "one reading record per character");
assert.equal(new Set(data.map(item => item.han)).size, data.length, "all characters are unique");
assert.equal(trivia.length, 100, "100 trivia questions");
assert.equal(new Set(trivia.map(x => x.id)).size, trivia.length, "unique trivia IDs");

const phraseCharacters = new Set(data.map(item => item.han));
const groups = {
  starter: 6, roots: 10, daily: 38, basic100: 46, daily150: 50,
  scene200: 50, roots250: 50, work300: 54, core319: 16, freq4: 51
};
for (const [group, minimum] of Object.entries(groups)) {
  assert.ok(data.filter(item => item.group === group).length >= minimum,
    "curriculum group " + group + " retains at least " + minimum + " characters");
}
assert.ok(data.every(item => Object.hasOwn(groups, item.group)), "all characters have a known curriculum group");

const anatomy = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(([, body]) => body).find(body => body.includes("window.QuickAnatomy="));
assert.ok(anatomy, "the quiz loads its anatomy entries");
vm.runInContext(anatomy, context, { filename: "index.html:anatomy" });
assert.equal(Object.keys(extras).length, data.length, "one reading record per in-app character");
const quizCharacters = new Set(data.map(item => item.han));
assert.equal(quizCharacters.size, data.length, "all in-app characters are unique");
for (const han of context.window.QuickAnatomy.entries.keys()) {
  assert.ok(quizCharacters.has(han), "anatomy entry has a quiz character " + han);
}

for (const item of data) {
  assert.match(item.cangjie, /^[A-Y]{1,5}$/, "Cangjie " + item.han);
  assert.equal(item.code, item.cangjie.length === 1
    ? item.cangjie : item.cangjie[0] + item.cangjie.at(-1),
    "Quick code " + item.han);
  assert.ok(item.source.startsWith("https://"), "source " + item.han);
  assert.match(extras[item.han]?.jyut || "", /^[a-z]+[1-6]$/,
    "Jyutping " + item.han);
  assert.ok(extras[item.han].words?.length, "related expressions " + item.han);
  for (const row of extras[item.han].words) {
    assert.equal(row.length, 3, "word tuple " + item.han);
    assert.ok(row[0] && row[1] && row[2], "complete word tuple " + item.han);
    assert.match(row[1], /^[a-z]+[1-6](?: [a-z]+[1-6])*$/,
      "word Jyutping " + item.han + " / " + row[0]);
  }
}

// Validate every local application script referenced by the two HTML entrypoints,
// including cache-busted URLs, and compile every inline script.
for (const [name, page] of [["index.html", html], ["phrases.html", phraseHtml]]) {
  for (const [, url] of page.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)) {
    assert.ok(url.startsWith("./"), name + ": local script path " + url);
    const relative = url.slice(2).split("?")[0];
    const file = path.join(base, relative);
    assert.ok(fs.existsSync(file), name + ": script missing " + relative);
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: relative });
  }
  const inline = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(inline.length > 0, "inline script exists " + name);
  for (const [, body] of inline)
    new vm.Script(body, { filename: name + ":inline" });
}

// Match the version of the shared dataset on both entrypoints to prevent stale phrase data.
const quizDataScript = html.match(/<script src="(\.\/data\.js\?v=[^"]+)"/)?.[1];
const phraseDataScript = phraseHtml.match(/<script src="(\.\/data\.js\?v=[^"]+)"/)?.[1];
assert.ok(quizDataScript, "quiz character data is cache-busted");
assert.equal(phraseDataScript, quizDataScript, "both views load the same version of the character data");
assert.match(html, /<script src="\.\/extras\.js\?v=[^"]+"/, "quiz reading data is cache-busted");

// The practical phrase catalog is shared across the phrase screen and future word search.
vm.runInContext(read("lexicon/core.js"), context, { filename: "lexicon/core.js" });
const phrases = context.window.QUICK_LEXICON_CORE;
assert.ok(Array.isArray(phrases), "shared phrase catalog exists");
assert.equal(phrases.length, 105, "105 complete phrase drills");
assert.equal(new Set(phrases.map(p => p.text)).size, 105, "unique phrase forms");
for (const phrase of phrases) {
  assert.ok(phrase.text && phrase.meaning && phrase.category, "complete phrase record");
  assert.match(phrase.jyutping, /^[a-z]+[1-6](?: [a-z]+[1-6])*$/,
    "valid Jyutping " + phrase.text);
  assert.equal(phrase.jyutping.split(" ").length, [...phrase.text].length,
    "phrase syllables " + phrase.text);
  for (const glyph of phrase.text)
    assert.ok(phraseCharacters.has(glyph), "phrase can be typed: " + phrase.text + "/" + glyph);
}

const tests = fs.readdirSync(path.join(base, "tests"))
  .filter(name => name.endsWith(".test.cjs"))
  .sort()
  .map(name => path.join(base, "tests", name));
assert.ok(tests.length >= 6, "regression suite must exist");

console.log("Quick Lab:", data.length, "characters,",
  new Set(Object.values(extras).flatMap(item => item.words.map(word => word[0]))).size,
  "unique related expressions,", phrases.length, "phrase drills.");
console.log("Running", tests.length, "regression suites...");
const result = spawnSync(process.execPath, ["--test", ...tests], {
  cwd: base,
  stdio: "inherit"
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
