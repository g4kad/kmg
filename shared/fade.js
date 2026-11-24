// "What you just watched" write-ups fade away as they scroll up and off the
// screen (owner's request). They arrive fully visible; once a write-up's top has
// passed the upper part of the screen it fades and drifts up slightly, and is gone
// by the time it leaves.
(() => {
  const els = ["after", "ais-after", "sg-after", "dq-after"]
    .map((id) => document.getElementById(id)?.querySelector(".inner"))
    .filter(Boolean);
  if (!els.length) return;
  let raf = 0;
  function paint() {
    raf = 0;
    const H = innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      // fully visible until its top reaches the top of the screen, then fades out
      // and is gone once its bottom is 12% from the top
      const k = Math.min(1, Math.max(0, (r.bottom - H * .12) / Math.max(1, r.height - H * .07)));
      el.style.opacity = k.toFixed(3);
      el.style.transform = k < 1 ? `translateY(${(-(1 - k) * 24).toFixed(1)}px)` : "";
    });
  }
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask);
  paint();
})();
