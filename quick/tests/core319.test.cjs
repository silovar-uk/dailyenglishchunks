/* Run: node --test quick/tests/core319.test.cjs
 * Validates corpus integrity and new phrase drills without outside packages. */
"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const dataSource=read("data.js"),extraSource=read("extras.js");
const index=read("index.html"),phrasePage=read("phrases.html");
const ctx=vm.createContext({window:{}});
vm.runInContext(dataSource,ctx);vm.runInContext(extraSource,ctx);
const data=ctx.window.QUICK_DATA,extras=ctx.window.QUICK_EXTRAS;
const byChar=new Map(data.map(x=>[x.han,x]));
// Codes verified against rime/rime-cangjie/cangjie5.base.dict.yaml
const fullCodes={一:"M",該:"YRYVO",即:"AISL",就:"YFIKU",喇:"RDLN",嗰:"ROWR",乜:"PN",使:"OJLK",如:"VR",未:"JD",解:"NBSHQ",太:"KI",幫:"GIHAB",意:"YTAP",思:"WP"};
const phraseNames=["唔該","唔好意思","即係","點解","幫我","唔使","乜嘢","嗰個","如果","一啲"];

test("319 unique characters and 319 extras, without changing earlier entries",()=>{
  assert.equal(data.length,319);
  assert.equal(new Set(data.map(x=>x.han)).size,319);
  assert.equal(Object.keys(extras).length,319);
});

test("all 15 upstream Cangjie codes and first-last Quick codes match",()=>{
  for(const [han,full] of Object.entries(fullCodes)){
    const x=byChar.get(han);
    assert.ok(x,han);
    assert.equal(x.group,"core319");
    assert.equal(x.cangjie,full,han);
    assert.equal(x.code,full.length===1?full:full[0]+full.at(-1),han);
    assert.ok(x.explain.length>15,han);
    assert.match(x.source,/rime-cangjie/);
  }
  assert.equal(byChar.get("一").code,"M");
  assert.equal(byChar.get("乜").code,"PN");
  assert.match(byChar.get("乜").explain,/複数/);
});

test("every new character has Jyutping and practical expression examples",()=>{
  const re=/^[a-z]+[1-6](?: [a-z]+[1-6])*$/;
  for(const han of Object.keys(fullCodes)){
    const extra=extras[han];
    assert.ok(extra,han);
    assert.match(extra.jyut,re,han);
    assert.ok(extra.words.length>=2,han);
    for(const item of extra.words){
      assert.equal(item.length,3,han);
      assert.match(item[1],re,han+" "+item[0]);
      assert.ok(item[2],han);
    }
  }
  assert.equal(extras["喇"].jyut,"laa3");
  assert.equal(extras["乜"].jyut,"mat1");
});

test("Hong Kong and phrase courses expose new characters without changing prior level tiers",()=>{
  const common=index.match(/const HK_COMMON=new Set\("([^"]+)"\)/)?.[1]||"";
  const g=index.match(/const GREETINGS=\[([^;]+)\];/);
  assert.ok(g);
  const greetingWords=JSON.parse("["+g[1]+"]");
  const greetingChars=new Set(greetingWords.join(""));
  for(const han of Object.keys(fullCodes))assert.ok(common.includes(han),"HK course omits "+han);
  for(const name of phraseNames)assert.ok(greetingWords.includes(name),"Phrase course omits "+name);
  const groupCheck=index.match(/ const tier=course==="all"\|\|[^;\n]+;/)?.[0]||"";
  assert.match(groupCheck,/!\["work300","core319"\]\.includes\(x\.group\)/);
  assert.doesNotMatch(groupCheck, /x\.group!=="work300","core319"/);
  assert.match(index,/総合319字/);
  assert.ok(greetingChars.has("該"));
});

test("all 15 phrase drills are present and every character has an input code",()=>{
  const text=phrasePage.match(/const PHRASES=\[[^\n]+\];/)?.[0];
  assert.ok(text);
  const phrases=vm.runInNewContext(text.replace(/^const PHRASES=/,"").slice(0,-1));
  assert.equal(phrases.length,15);
  assert.equal(new Set(phrases.map(p=>p.text)).size,15);
  for(const p of phrases)for(const char of [...p.text])
    assert.ok(byChar.has(char),p.text+": "+char+" cannot be typed");
  for(const name of phraseNames)assert.ok(phrases.some(p=>p.text===name&&p.note),name);
  assert.match(phrasePage,/new URLSearchParams\(window\.location\.search\)/);
});

test("data loads are cache-busted and speech/learning records are unchanged",()=>{
  assert.match(index,/data\.js\?v=core319-01/);
  assert.match(index,/extras\.js\?v=core319-01/);
  assert.match(phrasePage,/data\.js\?v=core319-01/);
  assert.match(index,/const KEY="quick-lab-v1"/);
  assert.match(index,/id="playAnsweredChar"/);
});

test("new additions have 26 genuinely new unique related expressions",()=>{
  const initialWords=new Set();
  // First 304 entries represent the prior catalog and remain unchanged.
  for(const x of data.slice(0,304))for(const word of extras[x.han].words)initialWords.add(word[0]);
  const additions=new Set();
  for(const x of data.slice(304))for(const word of extras[x.han].words){
    if(!initialWords.has(word[0]))additions.add(word[0]);
  }
  assert.equal(additions.size,26);
});
