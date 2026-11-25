(() => {
"use strict";
const $=id=>document.getElementById(id);
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const button=(label,cls,fn)=>{const n=el("button",cls,label);n.type="button";n.addEventListener("click",fn);return n};
const dateFmt=new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"});
const timeFmt=new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
const rootNames=Object.fromEntries([... "ABCDEFGHIJKLMNOPQRSTUVWXY"].map((k,i)=>[k,[..."日月金木水火土竹戈十大中一弓人心手口尸廿山女田難卜"][i]]));
const toneEmoji=["","😎","😲","😐","😩","🤨","😑"];
const toneNames=["","高平調","高上昇調","中平調","低下降調","低上昇調","低平調"];
const tonePaths=["","M5 5 L65 5","M5 20 Q37 18 65 5","M5 13 L65 13","M5 20 L65 25","M5 25 Q37 24 65 13","M5 20 L65 20"];
const base=new Map((window.QUICK_DATA||[]).map(q=>[q.han,q]));
let phrases=[],supplement={},current=null,serial=0;
const speech=window.speechSynthesis;
const voice=()=>{try{return (speech?.getVoices()||[]).find(v=>/^yue(?:[-_]|$)/i.test(v.lang)||/^(zh[-_]HK)$/i.test(v.lang)||/Cantonese|粵語|粤语|廣東話|广东话/i.test(v.name))||null}catch{return null}};
function updateVoice(){const v=voice();$("voiceInfo").textContent=v?"音声： "+v.name+"（香港広東語・端末音声）":"広東語音声が見つかりません。端末の読み上げ設定で香港広東語の音声を追加し、ページを再読み込みしてください。"}
function stop(){serial++;if(current){current.btn.setAttribute("aria-pressed","false");current.status.textContent="";current=null;try{speech.cancel()}catch{}}}
function play(text,rate,btn,status){
 if(current?.btn===btn){stop();return}
 stop();const v=voice();
 if(!v||!speech||!window.SpeechSynthesisUtterance){status.textContent="広東語音声を利用できません（普通話への代替は行いません）。";updateVoice();return}
 const token=serial;const u=new SpeechSynthesisUtterance(text);u.voice=v;u.lang=v.lang||"zh-HK";u.rate=rate;
 current={u,btn,status};btn.setAttribute("aria-pressed","true");status.textContent="再生中…";
 const finish=(msg)=>{if(token!==serial)return;btn.setAttribute("aria-pressed","false");status.textContent=msg;current=null};
 u.onend=()=>finish("");u.onerror=()=>finish("再生できませんでした。音声設定を確認してください。");
 try{speech.speak(u);if(speech.paused)speech.resume()}catch{finish("音声再生に失敗しました。")}
}
function charData(h){const q=base.get(h)||supplement[h];if(!q)return null;const cj=q.cangjie.toUpperCase();return {cj,code:cj.length===1?cj:cj[0]+cj.at(-1),source:q.source}}
function toneGraphic(t){const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 70 30");svg.setAttribute("aria-label",toneNames[t]||"声調不明");svg.setAttribute("role","img");if(tonePaths[t]){const path=document.createElementNS(svg.namespaceURI,"path");path.setAttribute("d",tonePaths[t]);path.setAttribute("stroke","#82e4cf");path.setAttribute("stroke-width","2.5");path.setAttribute("fill","none");path.setAttribute("stroke-linecap","round");svg.append(path)}return svg}
function normalize(x){return String(x??"").normalize("NFKC").toLowerCase().trim()}
function tokens(p){return p.jyutping.trim().split(/\s+/)}
function searchText(p){return normalize([p.text,p.jyutping,p.jyutping.replace(/[1-6]/g,""),p.meaning,p.note,p.category,...(p.variants||[]),...[...p.text].map(h=>charData(h)?.code),[...p.text].map(h=>charData(h)?.code).join(" "),dateFmt.format(new Date(p.addedAt))].join(" "))}
async function copy(text,status){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text)}else{const t=el("textarea");t.value=text;document.body.append(t);t.select();const ok=document.execCommand("copy");t.remove();if(!ok)throw Error()}status.textContent="コピーしました"}catch{status.textContent="コピーできませんでした。文字を長押ししてコピーしてください。"}}
function makeCard(p){
 const card=el("article","phrase");card.id=p.id;
 const top=el("div","top");const labels=el("div");const word=el("h2","word",p.text);word.lang="yue-Hant";labels.append(word,el("div","reading",p.jyutping));top.append(labels);
 const status=el("div","audio-status");status.setAttribute("aria-live","polite");
 const normal=button("▶ 音声","play",()=>play(p.speechText||p.text,.88,normal,status));normal.setAttribute("aria-label",p.text+"を再生・停止");normal.setAttribute("aria-pressed","false");top.append(normal);card.append(top,el("p","meaning",p.meaning));
 const codes=el("div","code-line");codes.setAttribute("aria-label","文字別の速成コードと声調");const syl=tokens(p);
 [...p.text].forEach((h,i)=>{const q=charData(h);const t=Number(syl[i]?.slice(-1));const item=el("div","code");item.append(el("span","",h+" "+(toneEmoji[t]||"")),el("b","",q?.code||"未登録"),el("span","",syl[i]||""));codes.append(item)});card.append(codes);
 const meta=el("div","meta");const dt=new Date(p.addedAt);const time=el("time","",dateFmt.format(dt)+" "+timeFmt.format(dt)+" 追加");time.dateTime=p.addedAt;meta.append(time,el("span","tag",p.category));card.append(meta);
 const actions=el("div","actions");const slow=button("ゆっくり再生","",()=>play(p.speechText||p.text,.63,slow,status));slow.setAttribute("aria-pressed","false");actions.append(slow,button("表現をコピー","",()=>copy(p.text,status)));card.append(actions,status);
 const detail=el("details","detail");detail.append(el("summary","","字根・声調・使い方を詳しく見る"));if(p.note)detail.append(el("p","muted",p.note));if(p.variants?.length)detail.append(el("p","muted","別表記： "+p.variants.join(" / ")));
 const chars=el("div","chars");[...p.text].forEach((h,i)=>{const q=charData(h);const t=Number(syl[i]?.slice(-1));const c=el("div","char");const han=el("strong","",h);han.lang="yue-Hant";c.append(han,el("div","reading",syl[i]||"—"),el("div","tone",(toneEmoji[t]||"")+" "+(t||"—")+"声"),toneGraphic(t),el("div","root",q?q.code+" · "+[...q.code].map(k=>rootNames[k]||k).join(""):"速成未登録"),el("div","muted",q?"倉頡 "+q.cj:""));if(q?.source&&/^https:\/\//.test(q.source)){const a=el("a","","出典");a.href=q.source;a.target="_blank";a.rel="noopener noreferrer";c.append(a)}chars.append(c)});detail.append(chars);card.append(detail);return card;
}
function render(){
 stop();const query=normalize($("search").value).split(/\s+/).filter(Boolean);const category=$("category").value;const newest=$("sort").value==="new";
 const items=phrases.filter(p=>(!category||p.category===category)&&query.every(q=>searchText(p).includes(q))).sort((a,b)=>{const order=Date.parse(b.addedAt)-Date.parse(a.addedAt)||b.id.localeCompare(a.id);return newest?order:-order});
 $("count").textContent=items.length+" / "+phrases.length+" 表現";const list=$("list");list.replaceChildren();
 if(!items.length){list.append(el("p","empty","該当する表現がありません。検索条件を変更してください。"));return}
 let day="";for(const p of items){const d=dateFmt.format(new Date(p.addedAt));if(d!==day){list.append(el("h2","day",d));day=d}list.append(makeCard(p))}
}
function validate(data){
 if(data.schemaVersion!==1||!Array.isArray(data.phrases))throw Error("Invalid data schema");
 const ids=new Set(),texts=new Set();
 for(const p of data.phrases){if(!p.id||!p.text||!p.meaning||!p.category||!p.jyutping||!Number.isFinite(Date.parse(p.addedAt))||ids.has(p.id)||texts.has(p.text.normalize("NFC"))||tokens(p).length!==[...p.text].length||!tokens(p).every(s=>/^[a-z]+[1-6]$/.test(s)))throw Error("Invalid phrase: "+p.id);ids.add(p.id);texts.add(p.text.normalize("NFC"))}
}
async function init(){
 try{const res=await fetch("./data/phrases.json",{cache:"no-store"});if(!res.ok)throw Error("HTTP "+res.status);const data=await res.json();validate(data);supplement=data.supplement||{};phrases=data.phrases;$("total").textContent=phrases.length;const today=dateFmt.format(new Date());$("today").textContent=phrases.filter(p=>dateFmt.format(new Date(p.addedAt))===today).length;for(const cat of [...new Set(phrases.map(p=>p.category))].sort()){const opt=el("option","",cat);opt.value=cat;$("category").append(opt)}$("search").addEventListener("input",render);$("category").addEventListener("change",render);$("sort").addEventListener("change",render);render()}catch(e){$("list").replaceChildren(el("p","empty","表現データを読み込めませんでした。ページを再読み込みしてください。"));console.error(e)}
}
updateVoice();speech?.addEventListener?.("voiceschanged",updateVoice);document.addEventListener("visibilitychange",()=>{if(document.hidden)stop()});init();
})();
