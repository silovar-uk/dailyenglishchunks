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

test("Hong Kong and phrase courses expose the intended characters without expanding earlier tiers",()=>{
  const courseOptions=["hk","phrase","rare","starter","basic100","daily150","scene200","roots250","anatomy","all"]
    .map(value=>({value}));
  const courseStart=index.indexOf("const SCENES=");
  const courseEnd=index.indexOf("function build()",courseStart);
  assert.ok(courseStart>=0&&courseEnd>courseStart);
  const courseContext=vm.createContext({window:{},$:id=>({options:id==="course"?courseOptions:[]})});
  vm.runInContext(dataSource,courseContext);
  vm.runInContext(extraSource,courseContext);
  const anatomy=[...index.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(([,body])=>body).find(body=>body.includes("window.QuickAnatomy="));
  assert.ok(anatomy);
  vm.runInContext(anatomy,courseContext);
  const quizData=courseContext.window.QUICK_DATA;
  const {inCourse,GREETINGS}=vm.runInContext(
    "const DATA=window.QUICK_DATA,EXTRAS=window.QUICK_EXTRAS;\n"+
    index.slice(courseStart,courseEnd)+"\nupdateCourseCounts(); ({inCourse,GREETINGS});",courseContext
  );
  for(const han of Object.keys(fullCodes)){
    const character=byChar.get(han);
    assert.ok(inCourse(character,"hk","all"),"HK course omits "+han);
    for(const tier of ["starter","basic100","daily150","scene200","roots250"]){
      assert.equal(inCourse(character,tier,"all"),false,tier+" includes "+han);
    }
  }
  for(const phrase of phraseNames){
    assert.ok(GREETINGS.includes(phrase),"Phrase course omits "+phrase);
    for(const han of phrase){
      assert.ok(inCourse(byChar.get(han),"phrase","all"),"Phrase course omits "+phrase+"/"+han);
    }
  }
  for(const option of courseOptions){
    const count=quizData.filter(character=>inCourse(character,option.value,"all")).length;
    assert.ok(option.textContent.endsWith("（"+count+"字）"),option.value);
  }
  assert.ok(courseOptions.find(x=>x.value==="all").textContent.endsWith("（"+quizData.length+"字）"));
});

test("all 15 original phrase drills survive the 55-item shared catalog",()=>{
  const lexiconSource=read("lexicon/core.js");
  const context=vm.createContext({window:{}});
  vm.runInContext(lexiconSource,context);
  const phrases=context.window.QUICK_LEXICON_CORE;
  assert.equal(phrases.length,55);
  assert.equal(new Set(phrases.map(p=>p.text)).size,55);
  for(const p of phrases)for(const char of [...p.text])
    assert.ok(byChar.has(char),p.text+": "+char+" cannot be typed");
  for(const name of phraseNames)
    assert.ok(phrases.some(p=>p.text===name&&p.note),name);
  assert.ok(phrasePage.includes("new URLSearchParams(window.location.search)"));
});

test("the quiz retains speech controls and the learning record key",()=>{
  assert.match(index,/const KEY="quick-lab-v1"/);
  assert.match(index,/id="playAnsweredChar"/);
});

test("new additions have 26 genuinely new unique related expressions",()=>{
  const initialWords=new Set();
  for(const x of data.filter(character=>character.group!=="core319")){
    for(const word of extras[x.han].words)initialWords.add(word[0]);
  }
  const additions=new Set();
  for(const han of Object.keys(fullCodes))for(const word of extras[han].words){
    if(!initialWords.has(word[0]))additions.add(word[0]);
  }
  assert.equal(additions.size,26);
});
