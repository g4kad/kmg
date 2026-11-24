// Light on the background grid (owner's request): as the visitor scrolls, short
// beams of light travel along the grid's major lines from one crosshair to the
// next, and crosshairs light up and fade like stars. Kept subtle: a few at a time,
// soft white tinted with the brand colour in view. Drawn on a canvas that sits with
// the grid (shared/aura.css #gridfx) and moves with the page. Off under reduced motion.
(() => {
  const grid = document.getElementById("grid");
  if (!grid || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.id = "gridfx"; cv.setAttribute("aria-hidden", "true");
  grid.after(cv);
  const ctx = cv.getContext("2d");
  const aura = document.getElementById("aura");

  let W = 0, H = 0, dpr = 1, tile = 160;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tile = innerWidth < 700 ? 120 : 160; // matches the grid's tile (aura.css)
  }
  size();
  addEventListener("resize", size);

  // the brand colour in view, lifted towards white, for the beams
  function tint() {
    const c = aura ? getComputedStyle(aura).getPropertyValue("--aura-1").match(/\d+/g) : null;
    const [r, g, b] = c ? c.map(Number) : [255, 255, 255];
    const m = (v) => Math.round(v + (255 - v) * .55);
    return `${m(r)},${m(g)},${m(b)}`;
  }

  // How visible the grid is at a screen point (0-1): the same soft patches as the
  // grid's own mask (#grid i in aura.css: repeating every 1440 px, sliding with the
  // page). The streaks and stars fade with it, so light never travels where no grid
  // line shows (owner's request: the streaks should move along the grid).
  function vis(x, y) {
    const vmax = Math.max(W, H), gy = y + (scrollY % 1440); // position on the grid's layer
    let v = 1;
    for (const [cx, cy, r] of [[.2 * W, 360, .26 * vmax], [.78 * W, 1080, .24 * vmax]]) {
      const k = Math.round((gy - cy) / 1440), d = Math.hypot(x - cx, gy - (cy + k * 1440));
      v *= Math.min(1, d / r);
    }
    // and the grid's corner fade (ellipse 85% x 80%, solid to 45%)
    const ex = (x - W / 2) / (W * .85), ey = (y - H / 2) / (H * .8), e = Math.hypot(ex, ey);
    return v * Math.min(1, Math.max(0, (1 - e) / .55));
  }
  const beams = [], stars = [];
  const MAX_BEAMS = innerWidth < 700 ? 6 : 9, MAX_STARS = innerWidth < 700 ? 6 : 10;
  const rnd = (a, b) => a + Math.random() * (b - a);
  // a random crosshair in view, kept away from the edges (the grid fades out there)
  function cross() {
    const cols = Math.floor(W / tile), rows = Math.ceil(H / tile);
    const i = Math.floor(rnd(0, cols + 1));
    const j = Math.round((scrollY + rnd(H * .05, H * .95)) / tile);
    return [i * tile + .5, j * tile + .5]; // page coordinates
  }
  function star(x, y, delay = 0) {
    if (stars.length >= MAX_STARS) return;
    stars.push({ x, y, t0: performance.now() + delay, dur: rnd(1400, 2400), size: rnd(.8, 1.15) });
    kick();
  }
  // Streaks run on any grid line, major or minor, anywhere on screen, and avoid the
  // lines used recently, so they don't keep turning up in the same spots (owner's request).
  const recent = [];
  function freeLine(vertical, n) {
    const step = tile / 5; // minor line spacing (32 px; 24 px on the phone)
    for (let tries = 0; tries < 8; tries++) {
      const major = Math.random() < .4;
      const k = vertical ? Math.floor(rnd(0, W / step)) : Math.floor((scrollY + rnd(H * .05, H * .95)) / step);
      const at = (major ? Math.round(k / 5) * 5 : k) * step + .5;
      const key = (vertical ? "v" : "h") + Math.round(at);
      if (!recent.some((r) => r[0] === key[0] && Math.abs(r.slice(1) - at) < step * 3) || tries === 7) {
        recent.push(key); if (recent.length > 10) recent.shift();
        return [at, major];
      }
    }
  }
  function beam(dir) {
    if (beams.length >= MAX_BEAMS) return;
    const vertical = Math.random() < .65; // mostly up / down the page, sometimes across
    const cells = rnd(1.6, 3.4); // long runs, so the long tails have room
    const [at, major] = freeLine(vertical);
    const step = tile / 5;
    // where along the line it starts: anywhere in view (on a grid point)
    const along = vertical ? Math.round((scrollY + rnd(H * .15, H * .95)) / step) * step + .5 : Math.round(rnd(0, W) / step) * step + .5;
    const x = vertical ? at : along, y = vertical ? along : at;
    if (vis(x, y - scrollY) < .5) return; // the grid is faded here: no streak
    const sx = vertical ? 0 : (Math.random() < .5 ? -1 : 1), sy = vertical ? (dir > 0 ? -1 : 1) : 0;
    beams.push({ x, y, dx: sx * tile * cells, dy: sy * tile * cells, t0: performance.now(), dur: 650 * cells + rnd(0, 400), col: tint(), landed: !major, k: major ? 1 : .7 });
    // a crosshair it leaves from glints too (only the major lines have them)
    if (major && Math.abs((x - .5) % tile) < 1 && Math.abs((y - .5) % tile) < 1) star(x, y);
    kick();
  }

  // draws only while something is lit, so the page is idle otherwise
  let raf = 0, lastY = scrollY, travel = 0;
  function kick() { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    ctx.clearRect(0, 0, W, H);
    const oy = -scrollY;
    ctx.lineCap = "round";
    for (let k = beams.length - 1; k >= 0; k--) {
      const b = beams[k], p = Math.min(1, (now - b.t0) / b.dur);
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // ease in-out
      const hx = b.x + b.dx * e, hy = b.y + b.dy * e + oy;
      const len = Math.hypot(b.dx, b.dy), tl = Math.min(len * e, tile * 1.6); // long streaks (owner's request)
      const ux = b.dx / len, uy = b.dy / len;
      const tx = hx - ux * tl, ty = hy - uy * tl;
      const fade = Math.sin(Math.PI * Math.min(1, p * 1.05)) * vis(hx, hy); // in and out, and only where the grid shows
      const gr = ctx.createLinearGradient(tx, ty, hx, hy);
      gr.addColorStop(0, `rgba(${b.col},0)`);
      gr.addColorStop(.7, `rgba(${b.col},${(.55 * fade).toFixed(3)})`);
      gr.addColorStop(1, `rgba(${b.col},${fade.toFixed(3)})`);
      // a wide soft glow under a bright core: more shine on the streaks (owner's request)
      ctx.strokeStyle = gr; ctx.shadowColor = `rgba(${b.col},${fade.toFixed(3)})`;
      ctx.globalAlpha = .14 * b.k; ctx.lineWidth = 4; ctx.shadowBlur = 6; // a faint halo (less glow, owner's request)
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.globalAlpha = b.k; ctx.lineWidth = 1.4; ctx.shadowBlur = 3;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      // a bright point at the head
      ctx.fillStyle = `rgba(255,255,255,${(.6 * fade * b.k).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(hx, hy, 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      if (p >= .92 && !b.landed) { b.landed = true; const ex = b.x + b.dx, ey = b.y + b.dy; if (Math.abs((ex - .5) % tile) < 1 && Math.abs((ey - .5) % tile) < 1) star(ex, ey); } // lights the crosshair it reaches
      if (p >= 1) beams.splice(k, 1);
    }
    ctx.shadowBlur = 0;
    for (let k = stars.length - 1; k >= 0; k--) {
      const s = stars[k], p = (now - s.t0) / s.dur;
      if (p < 0) continue;
      if (p >= 1) { stars.splice(k, 1); continue; }
      const x = s.x, y = s.y + oy, a = Math.pow(Math.sin(Math.PI * p), 2) * vis(x, y);
      if (y < -20 || y > H + 20) continue;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 14 * s.size);
      g.addColorStop(0, `rgba(255,255,255,${(.12 * a).toFixed(3)})`); // a soft glint, less shine (owner's request)
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(x - 15, y - 15, 30, 30);
      const arm = 5 * s.size + 1.5 * a;
      ctx.strokeStyle = `rgba(255,255,255,${(.5 * a).toFixed(3)})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - arm, y); ctx.lineTo(x + arm, y); ctx.moveTo(x, y - arm); ctx.lineTo(x, y + arm); ctx.stroke();
    }
    if (beams.length || stars.length) raf = requestAnimationFrame(frame);
  }
  // a slow, occasional twinkle even while the page is still, so it keeps flowing
  setInterval(() => { if (!document.hidden) star(...cross()); }, 2600);

  // scrolling sends the light: one beam about every 140 px travelled, plus a star now and then
  addEventListener("scroll", () => {
    const d = scrollY - lastY; lastY = scrollY;
    travel += Math.abs(d);
    while (travel > 140) { travel -= 140; beam(d); if (Math.random() < .5) star(...cross(), rnd(0, 300)); }
  }, { passive: true });
  addEventListener("pf:jump", () => { lastY = scrollY; travel = 0; beams.length = 0; stars.length = 0; });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick();
  });
})();
