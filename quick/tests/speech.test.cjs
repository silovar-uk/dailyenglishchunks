/* Run with: node --test quick/tests/speech.test.cjs (no npm dependencies). */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../speech.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");

function harness({ voices = [{ name: "HK Voice", lang: "zh-HK" }], unsupported = false, throwOnSpeak = false } = {}) {
  const spoken = [], listeners = {}, canceled = [];
  const synth = {
    paused: false,
    pending: false,
    speaking: false,
    getVoices: () => voices,
    addEventListener: (name, fn) => { listeners[name] = fn; },
    speak: utterance => { if (throwOnSpeak) throw Error("speech failed"); spoken.push(utterance); },
    cancel: () => { canceled.push(true); },
    resume: () => {}
  };
  function Utterance(text) { this.text = text; }
  const window = {
    speechSynthesis: unsupported ? null : synth,
    SpeechSynthesisUtterance: unsupported ? null : Utterance,
    document: { hidden: false, addEventListener: (name, fn) => { listeners[name] = fn; } }
  };
  vm.runInContext(source, vm.createContext({ window }));
  return { window, spoken, canceled, listeners, synth };
}

test("result screen has an accessible replay button and a visible audio status", () => {
  assert.match(html, /id="playAnsweredChar"[^>]*aria-label="回答した漢字の広東語発音を聞く"/);
  assert.match(html, /id="resultSoundMessage"[^>]*role="status"/);
  assert.match(html, /\$\("playAnsweredChar"\)\.onclick=/);
});

test("compound controls call the shared speech function directly from click", () => {
  assert.match(html, /play\.textContent="▶ 聞く"/);
  assert.match(html, /play\.onclick=\(\)=>speak\(word,play\)/);
});

test("the first click speaks immediately without an unnecessary cancel", () => {
  const h = harness(), status = [];
  assert.equal(h.window.QuickSpeech.play("早", update => status.push(update.phase)), true);
  assert.equal(h.spoken.length, 1);
  assert.equal(h.spoken[0].lang, "zh-HK");
  assert.equal(h.canceled.length, 0);
  assert.deepEqual(status, ["requested"]);
});

test("a second click cancels the first utterance without allowing late events to overwrite", () => {
  const h = harness(), first = [], second = [];
  h.window.QuickSpeech.play("字", v => first.push(v.phase));
  const outdated = h.spoken[0];
  h.window.QuickSpeech.play("你好", v => second.push(v.phase));
  assert.equal(h.canceled.length, 1);
  outdated.onend();
  outdated.onerror({ error: "canceled" });
  h.spoken[1].onstart();
  h.spoken[1].onend();
  assert.deepEqual(first, ["requested"]);
  assert.deepEqual(second, ["requested", "speaking", "ended"]);
  assert.equal(h.window.quickLabUtterance, null);
});

test("yue-HK voices are chosen explicitly", () => {
  const h = harness({ voices: [{ name: "Yue", lang: "yue-HK" }] });
  h.window.QuickSpeech.play("我愛你");
  assert.equal(h.spoken[0].lang, "yue-HK");
  assert.equal(h.spoken[0].voice.name, "Yue");
});

test("an empty voice list still attempts zh-HK synthesis", () => {
  const h = harness({ voices: [] });
  h.window.QuickSpeech.play("唔該");
  assert.equal(h.spoken[0].lang, "zh-HK");
  assert.equal(h.spoken[0].voice, undefined);
});

test("unsupported devices return a clear status instead of a fake success", () => {
  const h = harness({ unsupported: true }), updates = [];
  assert.equal(h.window.QuickSpeech.play("早", update => updates.push(update.phase)), false);
  assert.deepEqual(updates, ["unsupported"]);
});

test("a speech engine error is reported and the retained utterance released", () => {
  const h = harness({ throwOnSpeak: true }), updates = [];
  assert.equal(h.window.QuickSpeech.play("早", update => updates.push(update.phase)), false);
  assert.deepEqual(updates, ["error"]);
  assert.equal(h.window.quickLabUtterance, null);
});

test("backgrounding the page cancels speech and ignores late callbacks", () => {
  const h = harness(), status = [];
  h.window.QuickSpeech.play("早", update => status.push(update.phase));
  h.window.document.hidden = true;
  h.listeners.visibilitychange();
  h.spoken[0].onend();
  assert.deepEqual(status, ["requested"]);
  assert.equal(h.window.quickLabUtterance, null);
});
