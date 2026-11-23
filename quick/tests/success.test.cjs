/* Run: node --test quick/tests/success.test.cjs (no npm dependencies). */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const base = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(base, "index.html"), "utf8");
const successJS = fs.readFileSync(path.join(base, "success.js"), "utf8");
const successCSS = fs.readFileSync(path.join(base, "success.css"), "utf8");
const trivia = fs.readFileSync(path.join(base, "trivia.js"), "utf8");
const data = fs.readFileSync(path.join(base, "data.js"), "utf8");
const marker='<script src="./speech.js?v=speech-replay-01"></script><script>';
const inline = html.slice(html.indexOf(marker)+marker.length, html.lastIndexOf("</script>"));

function harness(reduced = false) {
  const animations = [], handlers = {}, saved = { stats: { 早: { wins: 4 } } };
  const makeElement = () => ({
    isConnected: true, classList: {contains:()=>false},
    animate(frames, opts) {
      const anim={ frames,opts,canceled:false,events:{},
        cancel(){this.canceled=true;this.events.cancel?.();},
        addEventListener(name,cb){this.events[name]=cb;} };
      animations.push(anim);
      return anim;
    }
  });
  const window = {
    document: {hidden:false,addEventListener:(key,cb)=>handlers[key]=cb},
    matchMedia:()=>({matches:reduced,addEventListener:(key,cb)=>handlers[key]=cb})
  };
  vm.runInContext(successJS, vm.createContext({window}));
  return {controller:window.QuickSuccess,animations,handlers,saved,makeElement,window};
}

test("new answer layout keeps the original glyph and places Next before optional details", () => {
  assert.match(html, /id="successStatus"/);
  assert.match(html, /id="successRootsText"/);
  assert.match(html, /id="successSurprise"/);
  assert.match(html, /id="batchSummary"/);
  assert.ok(html.indexOf('id="next"') < html.indexOf('id="resultWorkspace"'));
  assert.match(html, /id="playChar"/);
  assert.match(html, /id="playAnsweredChar"/);
  assert.match(html, /id="tabRoots"/);
  assert.match(html, /id="tabWords"/);
  assert.match(html, /href="\.\/success\.css\?v=neon-success-01"/);
  assert.match(html, /src="\.\/success\.js\?v=neon-success-01"/);
});

test("correct answers keep the same glyph visible; mistakes retain comparison", () => {
  assert.match(successCSS, /\.lcd\.answered\.is-correct \.lcd-main\s*\{\s*display:\s*flex/);
  assert.match(successCSS, /\.lcd\.answered\.is-correct \.answer-brief \{ display: none !important;/);
  assert.match(inline, /if\(good\)\{showSuccessState\(q\)/);
  assert.match(inline, /else\{\$\("lcd"\)\.classList\.add\("is-wrong"\)/);
  assert.match(inline, /setResultTab\("brief"\)/);
});

test("the score and storage keys are unchanged, and a result is graded only once", () => {
  assert.match(inline, /const KEY="quick-lab-v1"/);
  assert.match(inline, /if\(!q\|\|done\|\|typed.length!==q.code.length\)return/);
  assert.match(inline, /let good=typed===q.code/);
  assert.match(inline, /s\.due=addDays/);
  assert.match(inline, /stats\[q.han\]=s;persist\(\)/);
  assert.match(inline, /batchAnswered\+\+;if\(good\)batchCorrect\+\+/);
});

test("correct sound and phrase replay controls remain wired", () => {
  assert.match(inline, /\$\("playChar"\)\.onclick=/);
  assert.match(inline, /\$\("playAnsweredChar"\)\.onclick=/);
  assert.match(inline, /play\.onclick=\(\)=>speak\(word,play\)/);
});

test("the optional details and main Next action remain keyboard accessible", () => {
  assert.match(successCSS, /\.panel #next:not\(\.hidden\) \{[\s\S]*?min-height: 48px/);
  assert.match(successCSS, /\.result-workspace \.result-tabs button \{[\s\S]*?min-height: 44px/);
  assert.match(inline, /if\(shouldFocusNext\)\$\("next"\)\.focus\(\{preventScroll:true\}\)/);
});

test("the success engine draws no frames when motion is reduced", () => {
  const h = harness(true), el=h.makeElement();
  h.controller.ignite({glyph:el,status:el,roots:el});
  assert.equal(h.animations.length,0);
});

test("neon animation is canceled rather than blocking the next question", () => {
  const h = harness(), el=h.makeElement();
  h.controller.ignite({glyph:el,status:el,roots:el});
  assert.equal(h.animations.length,3);
  h.controller.cancel();
  assert.ok(h.animations.every(anim=>anim.canceled));
});

test("small surprises never appear twice per deck or before question three", () => {
  const h = harness();
  const decide=h.controller.shouldSurprise;
  assert.equal(decide({answered:2,random:()=>0}),false);
  assert.equal(decide({answered:3,random:()=>0}),true);
  assert.equal(decide({shown:true,answered:8,random:()=>0}),false);
  assert.equal(decide({answered:7,random:()=>1}),false);
});

test("completion provides real attempts and hits, without changing long-term history", () => {
  assert.match(inline, /batchAnswered=0;batchCorrect=0;batchSurpriseSeen=false/);
  assert.match(inline, /batchSummary"\)\.textContent="✦ このセット "\+batchCorrect\+" \/ "\+batchAnswered/);
  assert.match(inline, /\$\("next"\)\.textContent=pos===queue.length-1\?"結果を見る"/);
  assert.doesNotMatch(successJS, /localStorage|sessionStorage/);
});

test("all data remain present; motion and responsive settings are supported", () => {
  const context = vm.createContext({window:{}});
  vm.runInContext(data,context);
  assert.equal(context.window.QUICK_DATA.length,300);
  assert.equal((trivia.match(/"id":\s*"/g)||[]).length,100);
  assert.match(successCSS, /prefers-reduced-motion: reduce/);
  assert.match(successCSS, /prefers-contrast: more/);
  assert.match(successCSS, /max-height: 690px/);
  assert.equal((successCSS.match(/\{/g)||[]).length,(successCSS.match(/\}/g)||[]).length);
});
