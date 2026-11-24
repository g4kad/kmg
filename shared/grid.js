// Keeps the background grid (shared/aura.css #grid) moving with the page, so it
// reads as one continuous sheet. It slides the grid's inner layer with a transform
// (cheap: no repaint) by scrollY modulo the layer's 1440 px repeat.
(() => {
  const g = document.querySelector("#grid i");
  if (!g) return;
  let raf = 0;
  const paint = () => {
    raf = 0;
    g.style.transform = `translate3d(0, ${-(scrollY % 1440)}px, 0)`;
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  paint();
})();
