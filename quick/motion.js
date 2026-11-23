/* Quick Lab: Phase 1 key-and-slot motion. No learning data or storage access. */
(() => {
  "use strict";

  const reduced = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  const active = new Map();
  let enabled = true;

  function cancel(id) {
    const animation = active.get(id);
    if (!animation) return;
    active.delete(id);
    animation.cancel();
  }

  function cancelAll() {
    for (const id of [...active.keys()]) cancel(id);
  }

  function canAnimate(element) {
    return enabled &&
      !document.hidden &&
      !(reduced && reduced.matches) &&
      !!element &&
      element.isConnected &&
      typeof element.animate === "function";
  }

  function play(id, element, frames, options) {
    cancel(id);
    if (!canAnimate(element)) return;
    const animation = element.animate(frames, { fill: "none", ...options });
    active.set(id, animation);
    const clear = () => {
      if (active.get(id) === animation) active.delete(id);
    };
    animation.addEventListener("finish", clear, { once: true });
    animation.addEventListener("cancel", clear, { once: true });
  }

  function tapKey(letter) {
    // Keep the selector safe and make physical-keyboard input feel tactile too.
    if (!/^[A-Z]$/.test(letter)) return;
    const button = document.querySelector('#keyboard button[data-key="' + letter + '"]');
    play("key-" + letter, button, [
      { transform: "translateY(1.5px) scale(.97)" },
      { transform: "translateY(0) scale(1)" }
    ], { duration: 100, easing: "cubic-bezier(.2,.8,.2,1)" });
  }

  function fillSlot(index) {
    if (index !== 0 && index !== 1) return;
    const slot = document.getElementById("slot" + index);
    if (!slot) return;
    play("slot-value-" + index, slot.querySelector(".slot-value"), [
      { transform: "scale(.87)", opacity: .72 },
      { transform: "scale(1.08)", opacity: 1, offset: .58 },
      { transform: "scale(1)", opacity: 1 }
    ], { duration: 170, easing: "cubic-bezier(.2,.8,.2,1)" });
    play("slot-halo-" + index, slot.querySelector(".slot-halo"), [
      { opacity: 0 },
      { opacity: .95, offset: .35 },
      { opacity: 0 }
    ], { duration: 190, easing: "ease-out" });
  }

  function clearSlot(index) {
    if (index !== 0 && index !== 1) return;
    const slot = document.getElementById("slot" + index);
    if (!slot) return;
    // Cancel any unfinished fill animations to avoid a ghost letter or glow.
    cancel("slot-value-" + index);
    cancel("slot-halo-" + index);
    play("slot-clear-" + index, slot.querySelector(".slot-value"), [
      { transform: "scale(1.06)", opacity: .65 },
      { transform: "scale(1)", opacity: 1 }
    ], { duration: 100, easing: "ease-out" });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAll();
  });

  if (reduced && typeof reduced.addEventListener === "function") {
    reduced.addEventListener("change", () => {
      if (reduced.matches) cancelAll();
    });
  }

  window.QuickMotion = Object.freeze({
    tapKey,
    fillSlot,
    clearSlot,
    cancelAll,
    setEnabled(value) {
      enabled = !!value;
      if (!enabled) cancelAll();
    }
  });
})();
