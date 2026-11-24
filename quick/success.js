/* Quick Lab success experience. Decorative only: never modifies scores or storage.
   All motion is cancellable and independent from grading. */
((global) => {
  "use strict";

  const reduced = typeof global.matchMedia === "function"
    ? global.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  const running = new Map();
  const particles = new Set();
  let streak = 0;

  function cancel() {
    for (const a of running.values()) a.cancel();
    running.clear();
    for (const p of particles) p.remove();
    particles.clear();
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

  function ignite({ glyph, status, roots, surprise, combo = 0 }) {
    cancel();
    animate("glyph", glyph, [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 1, transform: "scale(.88)", offset: .15 },
      { opacity: 1, transform: "scale(1.18)", offset: .48 },
      { opacity: 1, transform: "scale(.98)", offset: .78 },
      { opacity: 1, transform: "scale(1)" }
    ], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    burst(glyph, roots, combo);
    victory(glyph, combo);
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

  function victory(glyph, combo) {
    if (!glyph?.isConnected || reduced?.matches || document.hidden || !glyph.animate) return;
    const layer=document.createElement("div");
    layer.setAttribute("aria-hidden","true");
    layer.style.cssText="position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;display:grid;place-items:center";
    document.body.appendChild(layer); particles.add(layer);
    const card=document.createElement("div");
    card.style.cssText="position:relative;text-align:center;color:#fff;font-weight:900;text-shadow:0 3px 0 #164c50,0 0 18px #00eac8;background:#123d49ee;border:3px solid #9affeb;border-radius:24px;padding:18px 38px;box-shadow:0 0 36px #00eac899";
    const han=document.createElement("div");han.textContent=glyph.textContent;han.style.cssText="font-size:clamp(80px,24vw,150px);line-height:1.1";
    const title=document.createElement("div");title.textContent=[3,5,10].includes(combo)?combo+" COMBO!":"正解！";title.style.cssText="font-size:32px;letter-spacing:.12em;color:#ffec99";
    card.append(han,title);layer.append(card);
    animate("victory-card",card,[{transform:"scale(.25) rotate(-12deg)",opacity:0},{transform:"scale(1.2) rotate(4deg)",opacity:1,offset:.23},{transform:"scale(1) rotate(0)",opacity:1,offset:.38},{transform:"scale(1)",opacity:1,offset:.72},{transform:"translateY(-70px) scale(.85)",opacity:0}],{duration:1050,easing:"linear"});
    for(let i=0;i<28;i++){
      const p=document.createElement("div"),a=i*Math.PI*2/28,r=130+(i%5)*35;
      p.style.cssText="position:absolute;left:50%;top:50%;width:10px;height:18px;border-radius:3px;background:"+["#ffe16b","#59ffe0","#ff79b9","#fff"][i%4];
      layer.append(p);
      animate("victory-confetti-"+i,p,[{transform:"translate(0,0) scale(.2)",opacity:0},{opacity:1,offset:.18},{transform:"translate("+Math.cos(a)*r+"px,"+Math.sin(a)*r+"px) rotate("+((i%2?1:-1)*360)+"deg)",opacity:0}],{duration:950,delay:60,easing:"ease-out"});
    }
    const a=layer.animate([{opacity:1},{opacity:1}],{duration:1100});
    running.set("victory-cleanup",a);
    a.onfinish=()=>{layer.remove();particles.delete(layer);if(running.get("victory-cleanup")===a)running.delete("victory-cleanup");};
  }

  function burst(glyph, roots, combo) {
    if (!glyph?.isConnected || reduced?.matches || global.document.hidden ||
        typeof glyph.animate !== "function") return;
    const host = glyph.closest(".lcd");
    if (!host) return;
    const g = glyph.getBoundingClientRect(), h = host.getBoundingClientRect();
    const x = g.left + g.width / 2 - h.left, y = g.top + g.height / 2 - h.top;
    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:4";
    // The LCD already has a positioned layout; use a fixed overlay if it does not.
    if (getComputedStyle(host).position === "static") {
      layer.style.position = "fixed";
      layer.style.inset = "auto";
      Object.assign(layer.style, {left:h.left+"px",top:h.top+"px",width:h.width+"px",height:h.height+"px"});
    }
    host.appendChild(layer); particles.add(layer);
    let n = 0;
    function spawn(css, text, frames, duration, delay = 0) {
      const p = document.createElement("span");
      p.style.cssText = "position:absolute;pointer-events:none;left:"+x+"px;top:"+y+"px;"+css;
      p.textContent = text; layer.appendChild(p);
      animate("fx-"+(++n), p, frames, {duration,delay,easing:"ease-out"});
    }
    spawn("width:64px;height:64px;margin:-32px;border:2px solid #9af9e9;border-radius:50%;box-shadow:0 0 12px #83f6ee", "", [
      {transform:"scale(.4)",opacity:0},{transform:"scale(.8)",opacity:.9,offset:.2},{transform:"scale(2.7)",opacity:0}
    ], 460, 90);
    const special = [3,5,10].includes(combo);
    const count = special ? 24 : 12;
    for(let i=0;i<count;i++){
      const a=i*2*Math.PI/count, r=55+(i%4)*14;
      spawn("font-size:14px;color:"+["#9af9e9","#ffc2e6","#ffe1a0"][i%3], "✦", [
        {transform:"translate(-50%,-50%) scale(.3)",opacity:0},
        {opacity:1,offset:.15},
        {transform:"translate("+Math.cos(a)*r+"px,"+Math.sin(a)*r+"px) scale(.6)",opacity:0}
      ], 430+(i%3)*40, 100);
    }
    const codes = roots?.querySelector("span")?.textContent?.split(" = ")[0] || "";
    [...codes].slice(0,2).forEach((key,i)=>{
      spawn("font-size:18px;font-weight:900;color:#bdfaf4;text-shadow:0 0 8px #83f6ee",key,[
        {transform:"translate("+(i===0?-65:65)+"px,55px)",opacity:0},
        {opacity:1,offset:.2},
        {transform:"translate(-50%,-50%) scale(.3)",opacity:0}
      ],260);
    });
    if(special) spawn("font-size:17px;font-weight:900;color:#ffe1a0;white-space:nowrap",combo+" COMBO!",[
      {transform:"translate(-50%,25px) scale(.8)",opacity:0},
      {transform:"translate(-50%,0) scale(1.1)",opacity:1,offset:.35},
      {transform:"translate(-50%,-28px)",opacity:0}
    ],650);
    const cleanup = layer.animate([{opacity:1},{opacity:1}],{duration:800});
    running.set("fx-cleanup",cleanup);
    cleanup.onfinish=()=>{layer.remove();particles.delete(layer);if(running.get("fx-cleanup")===cleanup)running.delete("fx-cleanup");};
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

  global.QuickSuccess = Object.freeze({ ignite, cancel, shouldSurprise, recordAnswer(good) { streak = good ? streak + 1 : 0; return streak; }, resetStreak() { streak = 0; } });
})(window);
