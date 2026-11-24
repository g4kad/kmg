// "Visit live site" link under each project's browser / phone (owner's request):
// the site's logo + a 9 px line, opening the real website in a new tab.
//
//   const live = window.liveLink(pinElement, { href, icon, name })
//   window.placeLive(live, V, s)   // in fit(): just under the frame on screen
//   live.style.opacity = …         // in draw(): fade in with the window
(() => {
  window.liveLink = (pin, { href, icon, name }) => {
    const a = document.createElement("a");
    a.className = "live";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", `Visit the live ${name} site (opens in a new tab)`);
    a.innerHTML = `<img src="${icon}" alt=""><span>Visit live site</span>`;
    a.style.opacity = 0;
    a.pin = pin; // the story's pinned stage (the link itself may move out of it on the phone)
    pin.append(a);
    // the project's secondary logo (wordmark, from Secondary-logo.ai) above the
    // window (owner's request); it fades in and out with the pill
    const key = { "Kedaipal": "kedaipal", "Aislelys": "aislelys", "SG Cards": "sgcards", "Deqly": "deqly" }[name];
    if (key) {
      const m = document.createElement("img");
      m.className = "wordmark"; m.src = `shared/wordmarks/${key}.png`; m.alt = name; m.style.opacity = 0;
      pin.append(m);
      a.mark = m;
    }
    // phone: a plain "Visit live site" link (no pill) in the introduction, 20 px
    // above the scroll hint (owner's request); it fades with the title
    const t = document.createElement("a");
    t.className = "live-intro"; t.href = href; t.target = "_blank"; t.rel = "noopener";
    t.setAttribute("aria-label", `Visit the live ${name} site (opens in a new tab)`);
    t.textContent = "Visit live site ↗";
    a.intro = t;
    return a;
  };
  // Phone view: keep the link 14 px under the phone that is in front (the widest one;
  // carousels shrink their side phones); it fades in as the stage scrolls away.
  const tracked = new Set();
  const follow = (a) => { tracked.add(a); if (!follow.raf) follow.raf = requestAnimationFrame(tick); };
  function tick() {
    follow.raf = 0;
    let any = false;
    tracked.forEach((a) => {
      if (!a.phone) return;
      any = true;
      const pin = a.pin, pr = pin.getBoundingClientRect();
      if (pr.bottom < 0 || pr.top > innerHeight) return;
      let best = null;
      pin.querySelectorAll(".phone").forEach((ph) => { const r = ph.getBoundingClientRect(); if (r.width && (!best || r.width > best.width)) best = r; });
      if (!best) return;
      // placed in the project's block, not the stage: on short screens the phone fills
      // the stage, which clips anything below it (owner's report: link not showing)
      const box = (a.offsetParent || document.body).getBoundingClientRect(); // the page (the block is not positioned)
      a.style.top = Math.round(best.bottom + 14 - box.top) + "px";
      // the presentation has ended once the pinned stage starts to scroll away
      const end = Math.min(1, Math.max(0, -pr.top / 80));
      a.style.setProperty("--end", end.toFixed(3));
      a.style.pointerEvents = end > .5 ? "" : "none";
    });
    if (any) follow.raf = requestAnimationFrame(tick);
  }
  // V: the story's view (rect / H), s: its stage scale. The stage is centred on screen.
  window.placeLive = (a, V, s) => {
    const bottom = innerHeight / 2 + (V.rect[1] + V.rect[3] - V.H / 2) * s;
    a.style.top = Math.round(bottom + (V.kind === "phone" ? 10 : 32)) + "px";
    // phone: the pill shows under the phone too (owner's request, after it was first
    // removed); its height is set every frame from the phone actually on screen (follow())
    a.style.display = "";
    a.phone = V.kind === "phone";
    // phone: plain "Visit live site ↗" text (no pill, no logo), like the link in the
    // project's introduction, shown only once the presentation has ended (owner's request)
    a.classList.toggle("plain", a.phone);
    const block = a.pin.parentElement.parentElement; // the project's block (e.g. #kedaipal)
    if (a.phone) { if (a.parentElement !== block) block.append(a); follow(a); }
    else if (a.parentElement !== a.pin) a.pin.append(a);
    // phone: the wordmark sits under the last line of the project's introduction
    // (the opening title) and fades with it (owner's request); desktop: above the window
    if (a.mark) {
      const hero = a.pin.querySelector(".hero");
      if (V.kind === "phone" && hero) {
        if (a.intro.parentElement !== hero) hero.append(a.intro);
        const hint = a.pin.querySelector(".hint");
        // measured inside the pinned stage (not on screen), so it holds for every
        // project whether or not its section is in view yet
        const pinH = a.pin.clientHeight;
        a.intro.style.bottom = (hint ? Math.round(pinH - hint.offsetTop + 20) : 120) + "px";
        if (a.mark.parentElement !== hero) hero.append(a.mark);
        a.mark.classList.add("in-hero"); a.mark.style.cssText = "";
        return;
      }
      if (a.mark.parentElement !== a.pin) a.pin.append(a.mark);
      a.intro.remove();
      a.mark.classList.remove("in-hero");
    }
    if (a.mark) {
      const top = innerHeight / 2 + (V.rect[1] - V.H / 2) * s; // the frame's top on screen
      const h = V.kind === "phone" ? 22 : 30;
      a.mark.style.height = h + "px";
      a.mark.style.top = Math.round(top - (V.kind === "phone" ? 14 : 26) - h) + "px";
    }
  };
})();
