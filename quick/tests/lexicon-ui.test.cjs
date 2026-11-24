/* Run: node --test quick/tests/lexicon-ui.test.cjs
 * DOM-lite integration tests for the complete practical phrase flow.
 */
"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const base=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(base,p),"utf8");
const source=read("phrases.html");
const marker='<script src="./speech.js?v=speech-replay-01"></script><script>';
const start=source.indexOf(marker);
if(start<0)throw Error("Missing phrase application anchor");
const inline=source.slice(start+marker.length,source.lastIndexOf("</script>"));

function harness(query="?phrase=%E5%94%94%E8%A9%B2") {
  const els=new Map(), documentListeners={}, spoken=[], stopped=[];
  function node(id) {
    if(els.has(id))return els.get(id);
    const states=new Set(),isSelect=id==="choose"||id==="phraseCategory";
    const obj={
      id,tagName:isSelect?"SELECT":id==="phraseSearch"||id==="typing"?"INPUT":"DIV",
      value:"",textContent:"",innerHTML:"",disabled:false,children:[],listeners:{},attrs:{},
      style:{},classList:{
        add:x=>states.add(x),remove:x=>states.delete(x),contains:x=>states.has(x),
        toggle:(x,flag)=>flag?states.add(x):states.delete(x)
      },
      setAttribute(k,v){this.attrs[k]=v},
      addEventListener(k,fn){this.listeners[k]=fn},
      append(...items){
        this.children.push(...items);
        if(isSelect&&!this.value&&items.length)this.value=items[0].value;
      },
      replaceChildren(...items){this.children=items}
    };
    els.set(id,obj);return obj;
  }
  const document={
    getElementById:node,
    createElement:tag=>({tagName:tag.toUpperCase(),value:"",textContent:""}),
    addEventListener:(k,fn)=>documentListeners[k]=fn
  };
  const window={
    location:{search:query},
    QuickSpeech:{
      stop(){stopped.push(true)},
      play(word,notify){
        spoken.push(word);notify({phase:"requested",voiceKnown:true});
        notify({phase:"speaking",voiceKnown:true});return true;
      }
    }
  };
  const context=vm.createContext({window,document,URLSearchParams,console});
  for(const file of ["data.js","lexicon/core.js","lexicon/search.js"])
    vm.runInContext(read(file),context,{filename:file});
  vm.runInContext(inline+"\nwindow.__studyTest={append,check,next,choosePhrase,getState:()=>({phraseIndex,pos,typed,done})};",
    context,{filename:"phrases.html:inline"});
  return {window,node,documentListeners,spoken,stopped,
    api:window.__studyTest,
    phrases:window.QUICK_LEXICON_CORE,
    dictionary:new Map(window.QUICK_DATA.map(x=>[x.han,x]))};
}

test("direct link selects an existing phrase and exposes its reading",()=>{
  const h=harness();
  assert.equal(h.phrases[h.api.getState().phraseIndex].text,"唔該");
  assert.equal(h.node("phraseReading").textContent,"m4 goi1");
  assert.equal(h.node("filterCount").textContent,"105 / 105表現");
});

test("search and scene filtering leave the active exercise unchanged",()=>{
  const h=harness();
  h.node("phraseSearch").value="ゆっくり";
  h.node("phraseSearch").listeners.input();
  assert.equal(h.node("filterCount").textContent,"1 / 105表現");
  assert.ok(h.node("choose").children.some(x=>x.textContent.includes("慢啲講")));
  assert.equal(h.phrases[h.api.getState().phraseIndex].text,"唔該");
  h.node("phraseCategory").value="food";
  h.node("phraseCategory").listeners.change();
  assert.equal(h.node("filterCount").textContent,"0 / 105表現");
  assert.equal(h.phrases[h.api.getState().phraseIndex].text,"唔該");
});

test("typing into search does not enter answer keys",()=>{
  const h=harness();
  h.documentListeners.keydown({target:h.node("phraseSearch"),key:"A"});
  assert.equal(h.api.getState().typed,"");
  assert.equal(h.node("slot0").textContent,"·");
});

test("explicit selection changes the active phrase and speech reads that phrase",()=>{
  const h=harness();
  const i=h.phrases.findIndex(x=>x.text==="慢啲講");
  h.node("choose").value=String(i);
  h.node("choose").onchange({target:h.node("choose")});
  assert.equal(h.api.getState().phraseIndex,i);
  assert.equal(h.node("phraseReading").textContent,"maan6 di1 gong2");
  h.node("listenPhrase").onclick();
  assert.equal(h.spoken.at(-1),"慢啲講");
  assert.match(h.node("audioStatus").textContent,/再生中/);
  assert.ok(h.stopped.length>=1);
});

test("all 105 phrases can be correctly entered character-by-character to completion",()=>{
  const h=harness("");
  for(let i=0;i<h.phrases.length;i++){
    h.api.choosePhrase(i);
    const item=h.phrases[i];
    for(const han of [...item.text]){
      const entry=h.dictionary.get(han);
      assert.ok(entry,han);
      for(const key of entry.code)h.api.append(key);
      h.api.check();
      assert.equal(h.node("status").textContent,"正解",item.text+" / "+han);
      h.api.next();
    }
    assert.match(h.node("feedback").textContent,/フレーズ完成/,item.text);
  }
});
