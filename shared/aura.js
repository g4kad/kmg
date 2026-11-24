// Colours for the flowing background (shared/aura.css): each project's brand
// palette, blended into the next one as the visitor scrolls between projects.
(() => {
  const aura = document.getElementById("aura");
  if (!aura) return;
  // [id, base, three colours]: each project's brand palette on near-black; the
  // Logo design section at the end is black with shades of grey (owner's request).
  const BRANDS = [
    ["intro", "#000000", ["#6E6E73", "#A1A1A6", "#404044"]], // Introduction: black and grey, like Logo design (owner's request)
    ["kedaipal", "#0A0A0B", ["#10B77F", "#5EEAD4", "#A7F3D0"]], // Kedaipal mint
    ["aislelys", "#0B0A09", ["#AAAB89", "#B99767", "#E0A6A1"]], // Aislelys sage, gold, blush
    ["sgcards", "#0A0A0B", ["#EF3E36", "#F59E0B", "#FCA5A5"]], // SG Cards red
    ["deqly", "#0A0A0B", ["#FA5252", "#D262A8", "#A97CF6"]], // Deqly red to purple
    ["logos", "#000000", ["#6E6E73", "#A1A1A6", "#404044"]], // Logo design: black and grey
  ];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t)).join(",")})`;
  const smooth = (t) => t * t * (3 - 2 * t);
  const blocks = BRANDS.map(([id]) => document.getElementById(id));

  let raf = 0, last = "";
  function paint() {
    raf = 0;
    // Each project keeps its colours through its write-up; the blend to the next
    // one happens only as the next project's title comes in (owner's request):
    // from the title coming into view to the title centred on screen.
    const H = innerHeight;
    let i = 0, t = 0;
    for (let k = 1; k < blocks.length; k++) {
      if (!blocks[k]) continue;
      // the title sits in the middle of its block's first screen, so it comes into
      // view once the block's top passes the middle of the screen
      const p = Math.min(1, Math.max(0, (scrollY + H / 2 - blocks[k].offsetTop) / (H / 2)));
      if (p >= 1) { i = k; t = 0; } else if (p > 0) { i = k - 1; t = smooth(p); break; } else break;
    }
    const [, baseA, a] = BRANDS[i], [, baseB, b] = BRANDS[Math.min(i + 1, BRANDS.length - 1)];
    // only touch the colours when they change: every change repaints the background
    const next = [mix(baseA, baseB, t), ...a.map((c, k) => mix(c, b[k], t))];
    if (next.join() === last) return;
    last = next.join();
    aura.style.setProperty("--aura-base", next[0]);
    next.slice(1).forEach((c, k) => aura.style.setProperty(`--aura-${k + 1}`, c));
  }
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask);
  paint();
})();
