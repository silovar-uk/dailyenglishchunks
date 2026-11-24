/* Run: node --test quick/tests/lexicon55.test.cjs
 * Search, completeness, compatibility and UI wiring; no third-party dependencies.
 */
"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const base=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(base,p),"utf8");
const data=read("data.js"),extras=read("extras.js"),lexicon=read("lexicon/core.js"),search=read("lexicon/search.js");
const page=read("phrases.html");
const window={};
const ctx=vm.createContext({window});
for(const source of [data,extras,lexicon,search])vm.runInContext(source,ctx);
const all=window.QUICK_LEXICON_CORE,searcher=window.QuickLexiconSearch;
const dictionary=new Set(window.QUICK_DATA.map(x=>x.han));
const legacy=["早晨","我愛你","你好","多謝","辛苦晒","唔該","唔好意思","即係","點解","幫我","唔使","乜嘢","嗰個","如果","一啲"];

test("55 unique phrases, including all 15 original entries and exactly 40 additions",()=>{
  assert.equal(all.length,55);
  assert.equal(new Set(all.map(x=>x.text)).size,55);
  for(const item of legacy)assert.ok(all.some(x=>x.text===item),"lost prior phrase "+item);
  assert.equal(all.filter(x=>!legacy.includes(x.text)).length,40);
});

test("all 55 words can be typed using only the 319 known characters",()=>{
  assert.equal(dictionary.size,319);
  for(const phrase of all)
    for(const ch of [...phrase.text])
      assert.ok(dictionary.has(ch),phrase.text+": missing "+ch);
});

test("all readings have one Jyutping syllable per Hanzi and a usage category",()=>{
  const valid=new Set(["greeting","conversation","request","food","shopping","travel","daily"]);
  for(const phrase of all){
    assert.match(phrase.jyutping,/^[a-z]+[1-6](?: [a-z]+[1-6])*$/);
    assert.equal(phrase.jyutping.split(" ").length,[...phrase.text].length);
    assert.ok(valid.has(phrase.category));
    assert.ok(phrase.meaning&&phrase.id);
    assert.ok(phrase.origin&&phrase.reviewStatus);
  }
});

test("manual entries stay flagged for native-speaker review",()=>{
  const curated=all.filter(x=>x.origin==="curated-v1");
  assert.equal(curated.length,8);
  assert.ok(curated.every(x=>x.reviewStatus==="initial-draft"));
  assert.ok(curated.some(x=>x.text==="可唔可以"));
});

test("search finds Hanzi, Japanese translations, and tone-number Jyutping",()=>{
  assert.ok(searcher.filter(all,{query:"唔好意思"}).some(x=>x.text==="唔好意思"));
  assert.ok(searcher.filter(all,{query:"ゆっくり"}).some(x=>x.text==="慢啲講"));
  assert.ok(searcher.filter(all,{query:"gei2 cin2"}).some(x=>x.text==="幾錢"));
  assert.ok(searcher.filter(all,{query:"geicin"}).some(x=>x.text==="幾錢"));
  assert.ok(searcher.filter(all,{query:"ＳＡＮ１ ＦＵ２"}).some(x=>x.text==="辛苦晒"));
});

test("category filters avoid cross-scene leakage",()=>{
  const food=searcher.filter(all,{category:"food"});
  assert.equal(food.length,9);
  assert.ok(food.every(x=>x.category==="food"));
  assert.equal(searcher.filter(all,{category:"unknown"}).length,0);
  assert.ok(searcher.filter(all,{category:"request",query:"幫"}).some(x=>x.text==="幫我"));
});

test("search does not reorder or mutate the original catalog",()=>{
  const before=JSON.stringify(all);
  searcher.filter(all,{category:"greeting",query:"ありがとう"});
  searcher.filter(all,{query:"ng"});
  assert.equal(JSON.stringify(all),before);
});

test("phrase UI loads lexicon and search before app, with speech controls",()=>{
  const core=page.indexOf('src="./lexicon/core.js?v=lexicon55-01"');
  const query=page.indexOf('src="./lexicon/search.js?v=lexicon55-01"');
  const inline=page.indexOf('const PHRASES=window.QUICK_LEXICON_CORE');
  assert.ok(core>=0&&query>core&&inline>query);
  assert.match(page,/id="phraseSearch"/);
  assert.match(page,/id="phraseCategory"/);
  assert.match(page,/id="listenPhrase"/);
  assert.match(page,/id="audioStatus"/);
  assert.match(page,/QuickSpeech\.play\(phrase\.text/);
  assert.match(page,/new URLSearchParams\(window\.location\.search\)/);
});

test("typing in a search field does not submit keys to the answer box",()=>{
  assert.match(page,/\["INPUT","TEXTAREA","SELECT"\]\.includes\(e\.target\.tagName\)/);
  assert.match(page,/\$\("choose"\)\.replaceChildren/);
  assert.match(page,/results\.length\+" \/ "\+PHRASES\.length\+"表現"/);
});
