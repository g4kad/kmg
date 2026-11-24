// Keeps the background grid (shared/aura.css #grid) moving with the page, so it
// reads as one continuous sheet, and drifts its faded patches along with it.
(() => {
  const g = document.getElementById("grid");
  if (!g) return;
  let raf = 0;
  const paint = () => {
    raf = 0;
    const y = -scrollY;
    g.style.backgroundPosition = `0 ${y}px`;
    const m = `0 0, 0 ${y * .6}px, 0 ${y * .8}px`;
    g.style.maskPosition = m; g.style.webkitMaskPosition = m;
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  paint();
})();
