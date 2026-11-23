/* Run: node --test quick/tests/question-shuffle.test.cjs
 * No packages to install: only Node.js built-in test, assert and vm modules. */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../question-shuffle.js"), "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(source, context, { filename: "question-shuffle.js" });
const { pick } = context.window.QuickQuestionShuffle;
const items = names => [...names].map(han => ({ han, code: "A" }));

test("prefers fresh questions outside the ten-question deck", () => {
  const queue = items("ABC");
  const choice = pick({ pool: items("ABCDE"), queue, position: 0, random: () => 0 });
  assert.equal(choice.item.han, "D");
  assert.equal(choice.swapIndex, -1);
  assert.deepEqual(queue.map(x => x.han), ["A", "B", "C"]);
});

test("never selects the current or previously answered question", () => {
  const choice = pick({ pool: items("ABCDE"), queue: items("ABC"), position: 1, random: () => 0 });
  assert.equal(choice.item.han, "D");
});

test("can swap a future item without duplicating it", () => {
  const queue = items("ABC");
  const choice = pick({ pool: items("ABC"), queue, position: 0, random: () => 0 });
  assert.equal(choice.item.han, "B");
  assert.equal(choice.swapIndex, 1);
  [queue[0], queue[choice.swapIndex]] = [queue[choice.swapIndex], queue[0]];
  assert.deepEqual(queue.map(x => x.han), ["B", "A", "C"]);
});

test("avoids recently shuffled-out questions while alternatives remain", () => {
  const choice = pick({
    pool: items("ABCDE"), queue: items("AB"), position: 0,
    seen: new Set(["C", "D"]), random: () => 0
  });
  assert.equal(choice.item.han, "E");
});

test("returns null when review contains no alternative", () => {
  assert.equal(pick({ pool: items("A"), queue: items("A"), position: 0 }), null);
});

test("returns null when all alternatives were answered earlier in the batch", () => {
  assert.equal(pick({ pool: items("ABC"), queue: items("ABC"), position: 2 }), null);
});

test("clamps the random source safely, including an exact return of one", () => {
  const base = { pool: items("ABCDE"), queue: items("AB"), position: 0 };
  assert.equal(pick({ ...base, random: () => 0 }).item.han, "C");
  assert.equal(pick({ ...base, random: () => 1 }).item.han, "E");
});

test("does not mutate pool, deck or historical data", () => {
  const pool = items("ABCD");
  const queue = pool.slice(0, 2);
  const original = JSON.stringify({ pool, queue });
  pick({ pool, queue, position: 0 });
  assert.equal(JSON.stringify({ pool, queue }), original);
});
