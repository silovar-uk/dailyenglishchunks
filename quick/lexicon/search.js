/* Dependency-free phrase filtering. No DOM, persistence or scoring side effects. */
((global) => {
  "use strict";

  const categories = Object.freeze({
    all: "すべて",
    greeting: "挨拶・お礼",
    conversation: "会話の基本",
    request: "依頼・聞き返し",
    food: "食事",
    shopping: "買い物",
    travel: "移動・時間",
    daily: "日常"
  });

  function normalize(value) {
    return String(value ?? "").normalize("NFKC").toLowerCase()
      .replace(/\s+/g, "");
  }

  function matches(item, query) {
    const q = normalize(query);
    if (!q) return true;
    const text = normalize([item.text, item.meaning, item.note].join(" "));
    const reading = normalize(item.jyutping);
    const readingWithoutTones = reading.replace(/[1-6]/g, "");
    return text.includes(q) || reading.includes(q) ||
      (!/[0-9]/.test(q) && readingWithoutTones.includes(q));
  }

  function filter(items, { query = "", category = "all" } = {}) {
    if (!Array.isArray(items)) return [];
    if (category !== "all" && !Object.hasOwn(categories, category)) return [];
    return items.filter(item =>
      item && (category === "all" || item.category === category) &&
      matches(item, query)
    );
  }

  global.QuickLexiconSearch = Object.freeze({ categories, filter, normalize });
})(window);
