// Quick Lab dataset regression checks. Run: node quick/test-data.js
const fs=require("node:fs"),assert=require("node:assert/strict");
const html=fs.readFileSync(__dirname+"/index.html","utf8");
const match=html.match(/const DATA=(\[[\s\S]*?\]);\s*const KEY=/);
assert.ok(match,"DATA block must exist");
const data=Function('"use strict";return '+match[1])();
const expected={早:"AJ",晨:"AV",我:"HI",你:"OF",好:"VD",明:"AB"};
assert.equal(data.length,Object.keys(expected).length);
for(const item of data){assert.equal(item.code,expected[item.han],"Code for "+item.han);assert.match(item.code,/^[A-Y]{2}$/);for(const key of ["jyut","meaning","first","last","explain"])assert.ok(item[key]);}
assert.equal(new Set(data.map(x=>x.han)).size,data.length);
console.log("Quick Lab dataset OK:",data.length,"characters");
