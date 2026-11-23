/* Quick Lab speech controller. Reusable by glyph and compound replay controls.
   No autoplay, network requests or learning record changes. */
((global) => {
  "use strict";

  const synth = global.speechSynthesis || null;
  let serial = 0;
  let current = null;
  let voices = [];

  function refreshVoices() {
    try {
      voices = synth && typeof synth.getVoices === "function" ? (synth.getVoices() || []) : [];
    } catch {
      voices = [];
    }
    return voices;
  }

  function hkVoice() {
    const available = refreshVoices();
    const regional = available.find(v => /^(zh[-_]HK|yue(?:[-_]HK)?)$/i.test(v.lang || ""));
    return regional || available.find(v =>
      /Cantonese|粵語|粤语|廣東話|广东话/i.test(v.name || "")
    ) || null;
  }

  function stop() {
    serial += 1; // Ignore late events raised by previously canceled utterances.
    current = null;
    global.quickLabUtterance = null;
    try { synth?.cancel(); } catch {}
  }

  function play(text, notify = () => {}) {
    stop();
    const token = serial;
    const value = String(text || "").trim();
    if (!value) return false;

    if (!synth || typeof synth.speak !== "function" ||
        typeof global.SpeechSynthesisUtterance !== "function") {
      notify({ phase: "unsupported", text: value });
      return false;
    }

    const voice = hkVoice();
    try {
      const utterance = new global.SpeechSynthesisUtterance(value);
      utterance.lang = voice?.lang || "zh-HK";
      if (voice) utterance.voice = voice;
      utterance.rate = 0.85;
      current = utterance;
      // Safari may need a retained utterance object until onend/onerror.
      global.quickLabUtterance = utterance;

      const send = (phase, error) => {
        if (serial !== token || current !== utterance) return;
        if (phase === "ended" || phase === "error") {
          current = null;
          global.quickLabUtterance = null;
        }
        notify({ phase, text: value, voiceKnown: !!voice, error: error || "" });
      };

      utterance.onstart = () => send("speaking");
      utterance.onend = () => send("ended");
      utterance.onerror = event => send("error", event?.error || "unknown");

      // Crucial: speak() happens synchronously inside the button click.
      synth.speak(utterance);
      if (synth.paused && typeof synth.resume === "function") synth.resume();
      send("requested");
      return true;
    } catch (error) {
      if (serial === token) {
        current = null;
        global.quickLabUtterance = null;
        notify({ phase: "error", text: value, voiceKnown: !!voice, error: error?.message || "unknown" });
      }
      return false;
    }
  }

  if (synth) {
    refreshVoices();
    if (typeof synth.addEventListener === "function") {
      synth.addEventListener("voiceschanged", refreshVoices);
    }
  }

  if (typeof global.document?.addEventListener === "function") {
    global.document.addEventListener("visibilitychange", () => {
      if (global.document.hidden) stop();
    });
  }

  global.QuickSpeech = Object.freeze({ play, stop, refreshVoices });
})(window);
