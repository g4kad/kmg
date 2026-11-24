// Logo design section: the tiles rise in one after another the first time the
// section comes into view. Without this script (or without IntersectionObserver)
// the tiles simply show.
(() => {
  const sec = document.getElementById("logos");
  if (!sec || !("IntersectionObserver" in window)) return;
  const tiles = [...sec.querySelectorAll(".tile")];
  tiles.forEach((t, i) => { t.style.transitionDelay = `${i * 45}ms`; });
  sec.classList.add("pre");
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      sec.classList.remove("pre"); io.disconnect();
      // drop the stagger once they are in, so hover / scroll highlights respond at once
      setTimeout(() => tiles.forEach((t) => { t.style.transitionDelay = ""; }), tiles.length * 45 + 700);
    }
  }, { threshold: .15 });
  io.observe(sec.querySelector(".grid"));
})();

// Touch screens (no hover): the tile in the middle band of the screen shows its
// glass and colours as the visitor scrolls (owner's request).
(() => {
  if (matchMedia("(hover: hover)").matches) return;
  const tiles = [...document.querySelectorAll("#logos .tile")];
  if (!tiles.length) return;
  let raf = 0;
  const paint = () => {
    raf = 0;
    // the last row can never reach the middle of the screen (the page ends), so
    // near the bottom the lit band slides down to meet it
    const H = innerHeight, left = document.documentElement.scrollHeight - (scrollY + H);
    const lr = tiles[tiles.length - 1].getBoundingClientRect();
    const lastAtEnd = (lr.top + lr.bottom) / 2 - Math.max(0, left); // its centre once scrolled to the end
    const shift = Math.max(0, lastAtEnd - H * .5) * (1 - Math.min(1, Math.max(0, left) / (H * .4)));
    const lo = H * .35 + shift, hi = H * .65 + shift;
    tiles.forEach((t) => { const r = t.getBoundingClientRect(), c = (r.top + r.bottom) / 2; t.classList.toggle("on", c > lo && c < hi); });
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  addEventListener("resize", paint);
  paint();
})();
