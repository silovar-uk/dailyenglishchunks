/* Run: node --test quick/tests/ui-polish.test.cjs
 * Static + generated-content regressions, with no browser/runtime dependencies. */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const base = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(base, "index.html"), "utf8");
const css = fs.readFileSync(path.join(base, "ui-polish.css"), "utf8");
const data = fs.readFileSync(path.join(base, "data.js"), "utf8");
const trivia = fs.readFileSync(path.join(base, "trivia.js"), "utf8");
const inline = html.slice(html.indexOf('<script src="./speech.js?v=speech-replay-01"></script><script>')+
  '<script src="./speech.js?v=speech-replay-01"></script><script>'.length,html.lastIndexOf("</script>"));
const context = vm.createContext({ window: {} });
vm.runInContext(data,context);
const DATA=context.window.QUICK_DATA;
const rootsMatch=inline.match(/ROOTS=(\{[^;]+\});/);
if(!rootsMatch)throw Error("ROOTS definition missing");
const ROOTS=vm.runInNewContext("("+rootsMatch[1]+")");
const start=inline.indexOf("const p1=",inline.indexOf("function check(){"));
const end=inline.indexOf("let diagnosis=",start);
if(start<0||end<0)throw Error("root card templates not found");
const renderRoots=new Function("q","ROOTS",inline.slice(start,end)+"return {p1,p2};");

test("the current glyph is emphasized and injected only as safe text",()=>{
  assert.match(html,/class="root-focus-glyph" lang="zh-HK"/);
  assert.match(inline,/querySelector\("\.root-focus-glyph"\)\.textContent=q\.han/);
  assert.match(css,/\.root-focus-glyph\s*\{/);
  assert.match(css,/font-size:\s*clamp\(70px,16vw,92px\)/);
});

test("all 300 characters render root representative glyphs, not descriptive placeholders",()=>{
  assert.equal(DATA.length,300);
  for(const q of DATA){
    const {p1,p2}=renderRoots(q,ROOTS);
    assert.ok(ROOTS[q.code[0]],"Unknown initial root for "+q.han);
    assert.match(p1,new RegExp('<div class="shape" lang="zh-HK">'+ROOTS[q.code[0]]+'</div>'));
    assert.doesNotMatch(p1,/先頭の筆画|最後の筆画|の末尾|の終端/);
    if(q.code.length>1){
      assert.ok(ROOTS[q.code[1]],"Unknown last root for "+q.han);
      assert.match(p2,new RegExp('<div class="shape" lang="zh-HK">'+ROOTS[q.code[1]]+'</div>'));
      assert.doesNotMatch(p2,/先頭の筆画|最後の筆画|の末尾|の終端/);
    }else{
      assert.equal(p2,"");
    }
  }
});

test("root imagery explicitly distinguishes representative keys from actual strokes",()=>{
  assert.match(html,/字根はキーの代表字形。元の漢字の筆画そのものを切り出した表示ではありません/);
  assert.match(html,/class="visual root-visual/);
});

test("Hong Kong trivia has a visible decorative lantern and native keyboard toggle",()=>{
  assert.match(html,/<details id="triviaDrawer" class="trivia-drawer"><summary>/);
  assert.match(html,/class="trivia-lantern" aria-hidden="true">🏮/);
  assert.match(html,/路地裏の発見/);
  assert.match(css,/\.trivia-drawer>summary:focus-visible/);
});

test("discovery count stays synchronized with trivia data",()=>{
  const matches=trivia.match(/"id":\s*"/g)||[];
  assert.equal(matches.length,100);
  assert.match(inline,/\$\("triviaCount"\)\.textContent=TRIVIA\.length\+"の豆知識"/);
});

test("small-screen, reduced-motion and increased-contrast variants are supported",()=>{
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /prefers-contrast: more/);
  assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
});

test("only the interface changed; all existing learning and speech behavior remains wired",()=>{
  assert.match(inline,/let good=typed===q\.code/);
  assert.match(inline,/const KEY="quick-lab-v1"/);
  assert.match(inline,/\$\("playAnsweredChar"\)\.onclick=/);
  assert.match(inline,/play\.onclick=\(\)=>speak\(word,play\)/);
  assert.match(html,/href="\.\/ui-polish\.css\?v=han-focus-lantern-01"/);
});
