/* A pure, dependency-free picker for the optional "another character" control.
   It never updates scores, progress counters, persistent state or the DOM. */
((global) => {
  "use strict";

  function pick({ pool, queue, position, seen = new Set(), random = Math.random }) {
    if (!Array.isArray(pool) || !Array.isArray(queue) || !queue[position]) return null;
    const currentHan = queue[position].han;
    const previous = new Set(queue.slice(0, position).map(item => item.han));
    const future = new Map(queue.slice(position + 1).map((item, i) => [item.han, position + i + 1]));
    const candidates = pool.filter(item =>
      item && item.han && item.han !== currentHan && !previous.has(item.han)
    );
    if (!candidates.length) return null;

    // First look outside the active ten-question deck; do not repeat a recently skipped character.
    const outside = candidates.filter(item => !future.has(item.han));
    const unseenOutside = outside.filter(item => !seen.has(item.han));
    const unseen = candidates.filter(item => !seen.has(item.han));
    const choices = unseenOutside.length ? unseenOutside :
      unseen.length ? unseen :
      outside.length ? outside : candidates;

    // Math.random is sufficient for a non-monetary practice shuffle.
    const roll = Number(random());
    const bounded = Number.isFinite(roll) ? Math.min(Math.max(roll, 0), 1 - Number.EPSILON) : 0;
    const chosen = choices[Math.floor(bounded * choices.length)];
    return {
      item: chosen,
      swapIndex: future.has(chosen.han) ? future.get(chosen.han) : -1
    };
  }

  global.QuickQuestionShuffle = Object.freeze({ pick });
})(window);
