// Project indicator on the right edge (owner's request): one mark per project;
// the one in view grows into a pill that fills as the visitor moves through it.
// Clicking a mark jumps straight to that project's browser. Styles: `.pnav` in shared/chrome.css.
(() => {
  const PROJECTS = [
    // [id, name, colour, where a click lands: scrolls into the section — just after
    // its browser / phone has risen and before any piece flies in]
    ["intro", "Introduction", "#F4F4F5", 0],
    ["kedaipal", "Kedaipal", "#34D399", 1.08],
    ["aislelys", "Aislelys", "#D9BC8C", 1.08],
    ["sgcards", "SG Cards", "#FF6B63", .9],
    ["deqly", "Deqly", "#FF7A7A", .69],
    ["logos", "Logo design", "#D4D4D8", 0],
  ].filter(([id]) => document.getElementById(id));
  if (!PROJECTS.length) return;

  const nav = document.createElement("nav");
  nav.className = "pnav";
  nav.setAttribute("aria-label", "Projects");
  nav.innerHTML = PROJECTS.map(([id, name, c]) =>
    `<button type="button" data-id="${id}" style="--c:${c}" aria-label="Go to ${name}"><span class="pnav-name">${name}</span><span class="pnav-mark"><i></i></span></button>`).join("");
  // a slowly flashing "Navigation" label above the marks, reading upwards (owner's request)
  const label = document.createElement("span");
  label.className = "pnav-label"; label.setAttribute("aria-hidden", "true"); label.innerHTML = "<span>Navigation</span>";
  nav.append(label);
  document.body.append(nav);
  const buttons = [...nav.querySelectorAll("button")];
  const blocks = PROJECTS.map(([id]) => document.getElementById(id));

  // Clicking jumps straight to that project's browser / phone, already up (past its
  // title), with no scrolling animation and no replay of what lies in between
  // (owner's request).
  const jump = (i) => {
    const el = blocks[i];
    scrollTo({ top: el.offsetTop + PROJECTS[i][3] * innerHeight, behavior: "instant" });
    dispatchEvent(new Event("pf:jump"));
  };
  buttons.forEach((b, i) => b.addEventListener("click", () => jump(i)));

  // Touch screens (owner's request): sliding a finger along the indicator moves from
  // project to project — whichever mark is nearest the finger is jumped to, with its
  // name shown beside it while the finger is down. The page itself doesn't scroll.
  let held = -1;
  const nearest = (y) => {
    let best = 0, d = Infinity;
    buttons.forEach((b, i) => { const r = b.getBoundingClientRect(), k = Math.abs((r.top + r.bottom) / 2 - y); if (k < d) { d = k; best = i; } });
    return best;
  };
  const follow = (e) => {
    const t = e.touches[0]; if (!t) return;
    e.preventDefault();
    const i = nearest(t.clientY);
    if (i !== held) { held = i; jump(i); paint(); }
  };
  nav.addEventListener("touchstart", (e) => { held = -1; nav.classList.add("drag"); follow(e); }, { passive: false });
  nav.addEventListener("touchmove", follow, { passive: false });
  const release = () => { held = -1; nav.classList.remove("drag"); };
  nav.addEventListener("touchend", release);
  nav.addEventListener("touchcancel", release);

  let raf = 0;
  function paint() {
    raf = 0;
    const mid = scrollY + innerHeight / 2;
    let on = 0;
    blocks.forEach((el, i) => { if (el.offsetTop <= mid) on = i; });
    // the "Navigation" label shows only on the introduction (owner's request)
    label.classList.toggle("gone", PROJECTS[on][0] !== "intro");
    buttons.forEach((b, i) => {
      const active = i === on;
      b.classList.toggle("on", active);
      if (active) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      // how far through this project (0 → 1), shown as the pill filling up
      const el = blocks[i];
      const p = Math.min(1, Math.max(0, (scrollY - el.offsetTop) / Math.max(1, el.offsetHeight - innerHeight)));
      b.style.setProperty("--p", active ? p.toFixed(3) : 0);
    });
  }
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask);
  paint();
})();
