/* Quick Lab success experience. Decorative only: never modifies scores or storage.
   All motion is cancellable and independent from grading. */
((global) => {
  "use strict";

  const reduced = typeof global.matchMedia === "function"
    ? global.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  const running = new Map();

  function cancel() {
    for (const a of running.values()) a.cancel();
    running.clear();
  }

  function animate(id, el, keyframes, options) {
    const old = running.get(id);
    if (old) { running.delete(id); old.cancel(); }
    if (!el || !el.isConnected || global.document?.hidden || reduced?.matches ||
        typeof el.animate !== "function") return null;
    const animation = el.animate(keyframes, { fill: "none", ...options });
    running.set(id, animation);
    const clean = () => { if (running.get(id) === animation) running.delete(id); };
    animation.addEventListener("finish", clean, { once: true });
    animation.addEventListener("cancel", clean, { once: true });
    return animation;
  }

  function ignite({ glyph, status, roots, surprise }) {
    cancel();
    animate("glyph", glyph, [
      { opacity: .78, transform: "scale(.96)" },
      { opacity: 1, transform: "scale(1.045)", offset: .58 },
      { opacity: 1, transform: "scale(1)" }
    ], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" });
    animate("status", status, [
      { opacity: .7, transform: "translateY(3px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 180, easing: "ease-out" });
    animate("roots", roots, [
      { opacity: .65, transform: "translateY(3px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 280, easing: "ease-out" });
    if (surprise && !surprise.classList.contains("hidden")) {
      animate("surprise", surprise, [
        { opacity: 0, transform: "translateY(5px) scale(.96)" },
        { opacity: 1, transform: "translateY(0) scale(1)" }
      ], { duration: 400, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  }

  // At most one surprise per set of ten. After two answers, it can appear
  // on any subsequent correct answer. No prize, streak or score effect.
  function shouldSurprise({ shown = false, answered = 0, random = Math.random } = {}) {
    const chance = Number(random());
    return !shown && answered >= 3 &&
      Number.isFinite(chance) && chance >= 0 && chance < .2;
  }

  if (reduced && typeof reduced.addEventListener === "function")
    reduced.addEventListener("change", () => { if (reduced.matches) cancel(); });
  global.document?.addEventListener?.("visibilitychange", () => {
    if (global.document.hidden) cancel();
  });

  global.QuickSuccess = Object.freeze({ ignite, cancel, shouldSurprise });
})(window);
