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
const read = name => fs.readFileSync(path.join(base, name), "utf8");
const trivia = fs.readFileSync(path.join(base, "trivia.js"), "utf8");
const inline = html.slice(html.indexOf('<script src="./speech.js?v=speech-replay-01"></script><script>')+
  '<script src="./speech.js?v=speech-replay-01"></script><script>'.length,html.lastIndexOf("</script>"));
function anatomyHarness(){
  const document={createElementNS(ns,tag){return this.createElement(tag)},createElement(tag){
    return {
      tag,children:[],attrs:{},dataset:{},
      get textContent(){return this.text},
      set textContent(value){this.text=value;this.children=[]},
      append(...items){this.children.push(...items)},
      replaceChildren(...items){this.children=items},
      setAttribute(name,value){this.attrs[name]=value},
      querySelector(selector){return this.children.find(node=>"."+node.className===selector)},
      focus(){}
    };
  }};
  const context=vm.createContext({window:{},document});
  vm.runInContext(read("data.js"),context);
  vm.runInContext(read("extras.js"),context);
  const script=inline.split("</script><script>")[0];
  vm.runInContext(script,context);
  const host=document.createElement("section");
  const {QuickAnatomy,QUICK_DATA}=context.window;
  const get=char=>QUICK_DATA.find(q=>q.han===char);
  return {host,mount:QuickAnatomy.mount,get,data:QUICK_DATA};
}

test("the anatomy room is the single answer explanation",()=>{
  assert.match(inline,/\$\("feedback"\)\.replaceChildren\(anatomy\)/);
  assert.doesNotMatch(inline,/class="visual root-visual"|正しい入力|同じ先頭または末尾/);
  assert.match(inline,/字根キーの代表字形と、実際に取る筆画は異なる場合があります/);
});

test("the selected position controls both the root explanation and the comparison examples",()=>{
  const {host,mount,get}=anatomyHarness();
  const question=get("早");
  host.dataset.origin=question.han;
  mount(host,question);
  const options=host.querySelector(".qa-options").children;
  const peers=()=>host.querySelector(".qa-related").children.filter(node=>node.tag==="button");
  const detail=()=>host.querySelector(".qa-detail");
  assert.equal(detail().dataset.side,"last");
  assert.equal(options[1].attrs["aria-pressed"],"true");
  assert.ok(peers().length);
  assert.ok(peers().every(node=>node.textContent.endsWith("J")));
  options[0].onclick();
  assert.equal(detail().dataset.side,"first");
  assert.equal(options[0].attrs["aria-pressed"],"true");
  assert.ok(peers().length);
  assert.ok(peers().every(node=>node.textContent.split(" ")[1].startsWith("A")));
  assert.ok(peers().some(node=>!node.textContent.endsWith("J")));
  peers()[0].onclick();
  assert.notEqual(host.querySelector(".qa-glyph").textContent,question.han);
  assert.equal(detail().dataset.side,"first");
  host.querySelector(".qa-back").onclick();
  assert.equal(host.querySelector(".qa-glyph").textContent,question.han);
  assert.equal(detail().dataset.side,"first");
});

test("verified strokes follow the selected position, even when both roots use the same key",()=>{
  const {host,mount,get}=anatomyHarness();
  mount(host,get("粥"));
  const glyph=host.querySelector(".qa-glyph");
  const reference=()=>glyph.children[0].children[0].attrs.href;
  const svg=read("stroke-parts.svg");
  assert.match(reference(),/#s7ca5-last$/);
  assert.ok(svg.includes('id="s7ca5-last"'));
  host.querySelector(".qa-options").children[0].onclick();
  assert.match(reference(),/#s7ca5-first$/);
  assert.ok(svg.includes('id="s7ca5-first"'));
});

test("every root position offers a verified overlay or a position explanation and reference",()=>{
  const {host,mount,data}=anatomyHarness();
  const sheets=["stroke-parts.svg","stroke-parts-extra.svg"];
  const symbols=new Map(sheets.map(name=>[
    name,new Set(Array.from(read(name).matchAll(/<symbol id="([^"]+)"/g),([,id])=>id))
  ]));
  let positions=0;
  let overlays=0;
  for(const question of data){
    mount(host,question);
    const options=host.querySelector(".qa-options").children;
    for(const button of options){
      button.onclick();
      positions++;
      const glyph=host.querySelector(".qa-glyph");
      const href=glyph.children[0]?.children[0]?.attrs.href;
      if(href){
        const [,sheet,id]=href.match(/^\.\/([^?]+)\?v=\d+#(.+)$/);
        assert.ok(symbols.get(sheet)?.has(id),href);
        overlays++;
      }else{
        assert.ok(host.querySelector(".qa-detail").children.some(node=>node.className==="qa-location"&&node.textContent),question.han);
        assert.match(host.querySelector(".qa-source").href,/^https:\/\/www\.hkcards\.com\/cj\/cj-char-/);
      }
    }
  }
  assert.equal(positions,633);
  assert.equal(overlays,[...symbols.values()].reduce((sum,ids)=>sum+ids.size,0));
});

test("every character shows its selected root key, with a single control for one-key answers",()=>{
  const {host,mount,data}=anatomyHarness();
  for(const question of data){
    mount(host,question);
    const options=host.querySelector(".qa-options").children;
    assert.equal(options.length,question.code.length,question.han);
    const detail=host.querySelector(".qa-detail");
    assert.equal(detail.dataset.side,question.code.length===1?"basic":"last",question.han);
    assert.equal(detail.children[0].children.at(-1).textContent,question.code.at(-1),question.han);
    if(question.code.length===1)assert.equal(host.querySelector(".qa-related").children.length,0);
  }
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
