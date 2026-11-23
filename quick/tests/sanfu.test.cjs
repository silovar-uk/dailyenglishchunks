/* Run: node --test quick/tests/sanfu.test.cjs (no external dependencies). */
"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const data=read("data.js"),extras=read("extras.js"),index=read("index.html"),phrasePage=read("phrases.html");
const ctx=vm.createContext({window:{}});
vm.runInContext(data,ctx);
vm.runInContext(extras,ctx);
const DATA=ctx.window.QUICK_DATA,EXTRAS=ctx.window.QUICK_EXTRAS;
const byChar=new Map(DATA.map(row=>[row.han,row]));
const upstream={辛:"YTJ",苦:"TJR",晒:"AMCW",哂:"RMCW"};

test("four distinct characters are present without duplicates",()=>{
  assert.equal(DATA.length,304);
  assert.equal(new Set(DATA.map(x=>x.han)).size,304);
  for(const char of Object.keys(upstream))assert.ok(byChar.has(char),char);
});

test("all new Cangjie V5 and Quick codes match the upstream dictionary",()=>{
  for(const [char,code] of Object.entries(upstream)){
    const row=byChar.get(char);
    assert.equal(row.cangjie,code);
    assert.equal(row.code,code[0]+code.at(-1));
    assert.match(row.source,/rime-cangjie/);
  }
});

test("the suffix 晒 differs from 哂 in writing, sound and meaning",()=>{
  assert.equal(EXTRAS["晒"].jyut,"saai3");
  assert.equal(EXTRAS["哂"].jyut,"can2");
  assert.match(byChar.get("哂").meaning,/あざ笑う/);
  assert.match(byChar.get("晒").meaning,/辛苦晒/);
});

test("related vocabulary includes canonical phrase and Cantonese readings",()=>{
  for(const char of ["辛","苦","晒"]){
    assert.ok(EXTRAS[char].words.some(row=>row[0]==="辛苦晒"&&row[1]==="san1 fu2 saai3"),char);
  }
  assert.ok(EXTRAS["哂"].words.some(row=>row[0]==="哂笑"&&row[1]==="can2 siu3"));
});

test("the phrase is selectable and its characters can all be typed",()=>{
  assert.match(phrasePage,/\{text:"辛苦晒",meaning:/);
  assert.match(phrasePage,/new URLSearchParams\(window\.location\.search\)\.get\("phrase"\)/);
  assert.match(phrasePage,/『辛苦哂』ではなく『辛苦晒』/);
  for(const c of [..."辛苦晒"])assert.ok(byChar.has(c),c);
});

test("main Hong Kong and everyday-phrase courses expose the new characters",()=>{
  const common=index.match(/const HK_COMMON=new Set\("([^"]+)"\)/)?.[1]||"";
  const rare=index.match(/const HK_RARE=new Set\("([^"]+)"\)/)?.[1]||"";
  for(const char of [..."辛苦晒"])assert.ok(common.includes(char),char);
  assert.ok(rare.includes("哂"));
  assert.match(index,/const GREETINGS=\[[^;]+?"辛苦晒"\]/);
  assert.match(index,/総合304字/);
});

test("data URLs are versioned and text-to-speech controls remain intact",()=>{
  assert.match(index,/data\.js\?v=sanfu-01/);
  assert.match(index,/extras\.js\?v=sanfu-01/);
  assert.match(phrasePage,/data\.js\?v=sanfu-01/);
  assert.match(index,/id="playAnsweredChar"/);
  assert.match(index,/play\.onclick=\(\)=>speak\(word,play\)/);
});
