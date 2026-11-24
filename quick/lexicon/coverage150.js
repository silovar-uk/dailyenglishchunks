/* The Phase-4 gap-audit seed list.
 * This is NOT a ranked "top 150" or a measured coverage of all conversation.
 * It merges the 104 Cantonese stop-word-style candidates used in the study
 * with 46 task-oriented phrases; individual source methodology differs.
 * Preserve raw strings for reproducible before/after comparisons.
 * Some corpus spelling variants are not the best beginner-facing HK form.
 */
(() => {
  "use strict";
  const functionWords = "一啲 一定 不如 不過 之後 乜 乜嘢 人哋 但係 你 你哋 佢 佢哋 係 個 其他 冇 再 到 即 即係 原來 去 又 可以 可能 同 同埋 吖 呀 呢 咁 咗 咩 咪 哦 哩 哩個 哩啲 哩度 哩樣 唔 唔使 唔係 啊 啲 喎 喺 喺度 嗯 嗰 嗰個 嗰啲 嗰度 嘅 嘢 噉 噉樣 因為 多 太 好 如果 就 已經 幾 幾多 得 想 應該 成日 我 我哋 或者 所以 最 會 有 有冇 有啲 未 梗係 然之後 由 真係 睇 知 而 而家 自己 要 覺得 話 諗 講 譬如 跟住 返 過 邊個 都 點 點樣 點解".split(" ");
  const practical = "你好 早晨 多謝 唔該 唔該晒 辛苦晒 對唔住 唔好意思 唔使客氣 再見 可唔可以 幫我 等陣 講多次 慢啲講 我想要 唔明 唔知道 冇問題 唔得 幾錢 太貴 平啲 有冇貨 買單 埋單 畀錢 現金 碌卡 邊度 點去 落車 上車 轉車 廁所 地鐵 巴士 食飯 飲水 食咗飯未 好食 好攰 唔舒服 小心 醫院 救命".split(" ");
  const raw = [...new Set([...functionWords,...practical])];

  // Use Hong Kong demonstrative forms in the beginner-facing list.
  // These substitutions are editorial preferences, not universal semantic equivalences.
  const preferredForms = Object.freeze({
    "哩個":"呢個", "哩啲":"呢啲", "哩度":"呢度", "哩樣":"呢樣"
  });
  // 哩 has other valid functions (as a particle): do not falsely call it
  // identical to 呢; keep it in raw historical audit, outside beginner core.
  const reserved = Object.freeze(["哩"]);
  const canonical = [...new Set(raw.filter(w=>!reserved.includes(w))
    .map(w=>preferredForms[w] || w))];

  if(raw.length!==150 || canonical.length!==149)
    throw Error("Review the 150-word candidate seed before changing targets");

  window.QUICK_COVERAGE_150 = Object.freeze({
    raw:Object.freeze(raw),
    canonical:Object.freeze(canonical),
    functionWords:Object.freeze(functionWords),
    practical:Object.freeze(practical),
    preferredForms,
    reserved,
    definition:"character-level typing coverage, not spoken-language comprehension",
    sourceUrls:Object.freeze([
      "https://docs.pycantonese.org/v4.3.0/_modules/pycantonese/stop_words.html",
      "https://github.com/gwinterstein/Cifu",
      "https://words.hk/zidin/%E5%91%A2%E5%80%8B"
    ])
  });
})();
