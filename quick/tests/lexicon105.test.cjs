/* Run: node --test quick/tests/lexicon105.test.cjs
 * Historical phrase compatibility, newly typeable expressions, and all UI connections.
 */
"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const ctx=vm.createContext({window:{}});
for(const f of ["data.js","extras.js","lexicon/core.js","lexicon/coverage150.js","lexicon/search.js"])
  vm.runInContext(read(f),ctx,{filename:f});
const {QUICK_DATA:data,QUICK_EXTRAS:extras,QUICK_LEXICON_CORE:lexicon,QUICK_COVERAGE_150:audit,QuickLexiconSearch:search}=ctx.window;
const legacy=lexicon.slice(0,55),added=lexicon.slice(55);
const charSet=new Set(data.map(x=>x.han));
const wordTuples=new Map();
for(const e of Object.values(extras))for(const row of e.words)
  if(!wordTuples.has(row[0]))wordTuples.set(row[0],row);
const originals=["辛苦晒","唔該","唔好意思","慢啲講","幾錢"];
const practical=["等陣","講多次","冇問題","太貴","廁所","醫院","救命","唔該晒","食咗飯未","平啲"];

test("the 55 prior phrase IDs and all deep-link spellings remain stable",()=>{
  assert.equal(lexicon.length,105);
  assert.equal(new Set(lexicon.map(x=>x.id)).size,105);
  assert.equal(new Set(lexicon.map(x=>x.text)).size,105);
  for(let i=0;i<55;i++)assert.equal(legacy[i].id,"hk-"+String(i+1).padStart(3,"0"));
  for(const form of originals)assert.ok(legacy.some(x=>x.text===form),form);
});

test("all 50 additions come from existing linked vocabulary in the 149-candidate audit",()=>{
  assert.equal(added.length,50);
  const candidate=new Set(audit.canonical);
  for(let i=0;i<added.length;i++){
    const p=added[i];
    assert.equal(p.id,"hk-"+String(i+56).padStart(3,"0"));
    assert.ok(candidate.has(p.text),p.text);
    assert.ok([...p.text].length>=2,p.text);
    assert.equal(p.origin,"existing-extra-audited");
    assert.equal(p.source,"quick/extras.js");
    assert.equal(p.reviewStatus,"from-existing-dictionary-not-native-reviewed");
    assert.equal(p.candidateSet,"coverage150-canonical");
    const original=wordTuples.get(p.text);
    assert.ok(original,p.text);
    assert.equal(p.jyutping,original[1],p.text);
  }
});

test("all 105 phrase exercises remain typeable and pronunciations align with characters",()=>{
  for(const p of lexicon){
    assert.ok([...p.text].every(x=>charSet.has(x)),p.text);
    assert.match(p.jyutping,/^[a-z]+[1-6](?: [a-z]+[1-6])*$/,p.text);
    assert.equal(p.jyutping.split(" ").length,[...p.text].length,p.text);
    assert.ok(p.meaning && p.category && p.id,p.text);
  }
});

test("the share of 149 audited expressions directly available as exercises increases to 83",()=>{
  const present=new Set(lexicon.map(x=>x.text));
  assert.equal(audit.canonical.length,149);
  assert.equal(audit.canonical.filter(x=>present.has(x)).length,83);
  assert.equal(audit.canonical.filter(x=>[...x].every(c=>charSet.has(c))).length,149);
});

test("previously blocked real-life phrases are searchable by Japanese and Jyutping",()=>{
  for(const form of practical)assert.ok(lexicon.some(x=>x.text===form),form);
  assert.ok(search.filter(lexicon,{query:"ちょっと待って"}).some(x=>x.text==="等陣"));
  assert.ok(search.filter(lexicon,{query:"gong2 do1 ci3"}).some(x=>x.text==="講多次"));
  assert.ok(search.filter(lexicon,{query:"病院"}).some(x=>x.text==="醫院"));
  assert.ok(search.filter(lexicon,{query:"gau ming"}).some(x=>x.text==="救命"));
});

test("emergency and health phrases have their own searchable category",()=>{
  assert.equal(search.categories.help,"困ったとき・体調");
  const help=search.filter(lexicon,{category:"help"});
  assert.equal(help.length,4);
  for(const form of ["廁所","唔舒服","醫院","救命"])
    assert.ok(help.some(x=>x.text===form),form);
  assert.ok(help.every(x=>x.category==="help"));
});

test("the quiz and phrase page expose the updated catalog and speech controls",()=>{
  const page=read("phrases.html"),main=read("index.html");
  assert.match(main,/実用105表現/);
  assert.match(page,/id="phraseSearch"/);
  assert.match(page,/id="listenPhrase"/);
  assert.match(page,/QuickSpeech\.play\(phrase\.text/);
  assert.match(page,/PHRASES\.length===0/);
  assert.match(page,/lexicon\/core\.js\?v=lexicon105-01/);
  assert.match(page,/lexicon\/search\.js\?v=lexicon105-01/);
  assert.match(page,/new URLSearchParams\(window\.location\.search\)/);
});
