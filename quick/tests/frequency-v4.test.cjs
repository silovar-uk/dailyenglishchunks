/* Run: node --test quick/tests/frequency-v4.test.cjs
 * Phase 4: 150-candidate baseline and new 51-character curriculum.
 * Counts are character-input coverage, not corpus frequency or comprehension.
 */
"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const base=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(base,name),"utf8");
const dataSource=read("data.js"),extrasSource=read("extras.js");
const index=read("index.html"),phrasePage=read("phrases.html");
const context=vm.createContext({window:{}});
for(const name of ["data.js","extras.js","lexicon/coverage150.js","lexicon/core.js"])
  vm.runInContext(read(name),context,{filename:name});
const data=context.window.QUICK_DATA, extras=context.window.QUICK_EXTRAS;
const audit=context.window.QUICK_COVERAGE_150,lexicon=context.window.QUICK_LEXICON_CORE;
const additions=data.filter(item=>item.group==="freq4");
const inputSet=new Set(data.map(item=>item.han));
const previousSet=new Set(data.filter(item=>item.group!=="freq4").map(item=>item.han));
const ready=(words,chars)=>words.filter(word=>[...word].every(c=>chars.has(c)));

test("371 unique character entries with 51 new dictionary-sourced additions",()=>{
  assert.equal(data.length,371);
  assert.equal(Object.keys(extras).length,371);
  assert.equal(new Set(data.map(x=>x.han)).size,371);
  assert.equal(additions.length,51);
  assert.equal(previousSet.size,320);
});

test("all added characters have derivable Quick codes and Cantonese readings",()=>{
  for(const row of additions){
    assert.match(row.cangjie,/^[A-Y]{1,5}$/);
    assert.equal(row.code,row.cangjie.length===1?row.cangjie:row.cangjie[0]+row.cangjie.at(-1),row.han);
    assert.match(extras[row.han]?.jyut||"",/^[a-z]+[1-6]$/,row.han);
    assert.match(row.source,/rime-cangjie/);
    assert.match(row.pronunciationSource,/rime-cantonese/);
    assert.equal(row.reviewStatus,"dictionary-checked-not-native-reviewed");
    assert.ok(extras[row.han].words.length>=1,row.han);
    for(const [phrase,jyut,meaning] of extras[row.han].words){
      assert.ok(phrase.includes(row.han),row.han+" / "+phrase);
      assert.ok([...phrase].every(c=>inputSet.has(c)),row.han+" / "+phrase);
      assert.match(jyut,/^[a-z]+[1-6](?: [a-z]+[1-6])*$/);
      assert.equal(jyut.split(" ").length,[...phrase].length);
      assert.ok(meaning,phrase);
    }
  }
});

test("audited 150 candidate phrases grow from 102 to 145 typeable",()=>{
  assert.equal(audit.raw.length,150);
  assert.equal(ready(audit.raw,previousSet).length,102);
  assert.equal(ready(audit.raw,inputSet).length,145);
  const remaining=audit.raw.filter(word=>![...word].every(c=>inputSet.has(c)));
  assert.deepEqual([...remaining].sort(),["哩","哩個","哩啲","哩度","哩樣"].sort());
});

test("Hong Kong preferred-writing course reaches 149 of 149 distinct candidates",()=>{
  assert.equal(audit.canonical.length,149);
  assert.equal(ready(audit.canonical,inputSet).length,149);
  assert.equal(audit.preferredForms["哩個"],"呢個");
  assert.ok(audit.reserved.includes("哩"));
  assert.ok(audit.definition.includes("not spoken-language comprehension"));
});

test("old staged courses exclude freq4; all course includes it",()=>{
  const marker=index.match(/ const tier=courseId==="all"\|\|[^;\n]+;/);
  assert.ok(marker,"inCourse tier expression");
  const allowed=new Function("x","courseId",marker[0]+"return tier;");
  const example=additions[0];
  for(const c of ["starter","basic100","daily150","scene200","roots250"])
    assert.equal(allowed(example,c),false,c);
  assert.equal(allowed(example,"all"),true);
  const common=index.match(/const HK_COMMON=new Set\("([^"]+)"\)/)?.[1]||"";
  assert.ok(additions.every(row=>common.includes(row.han)),"HK practical course includes additions");
});

test("the original 55-phrase catalog, speech and progress key remain intact",()=>{
  assert.equal(lexicon.length,55);
  assert.ok(lexicon.every(x=>[...x.text].every(c=>inputSet.has(c))));
  assert.match(index,/const KEY="quick-lab-v1"/);
  assert.match(index,/id="playAnsweredChar"/);
  assert.match(phrasePage,/id="listenPhrase"/);
  const quizSrc=index.match(/src="(\.\/data\.js\?v=[^"]+)"/)?.[1];
  const phraseSrc=phrasePage.match(/src="(\.\/data\.js\?v=[^"]+)"/)?.[1];
  assert.equal(phraseSrc,quizSrc);
  assert.match(quizSrc,/frequency150-v1/);
});

test("representative contextual readings avoid common polyphonic traps",()=>{
  assert.equal(extras["平"].jyut,"peng4");
  assert.ok(extras["平"].words.some(x=>x[0]==="平啲"&&x[1]==="peng4 di1"));
  assert.equal(extras["為"].jyut,"wai6");
  assert.ok(extras["為"].words.some(x=>x[0]==="因為"&&x[1]==="jan1 wai6"));
  assert.equal(extras["覺"].jyut,"gok3");
  assert.ok(extras["覺"].words.some(x=>x[0]==="覺得"&&x[1]==="gok3 dak1"));
  assert.ok(!inputSet.has("哩"));
});
