// SG Cards story: scroll engine + content. Runs inside #sgcards.
// Screen 1 (the home page), as the owner asked:
//   1. the browser rises on the top of the home page;
//   2. the page scrolls down to "Select Location" (West tab);
//   3. every store card in view flies in, zooming down to size;
//   4. Mana Pro's popup opens over the dimmed page;
//   5. it flips over to its "More Info" side ("everything else").
// Screen 2 (owner's request): the Articles page. It peeks in on the right (dimmed;
// 15% smaller on the phone), the row slides left to it, its article cards pop in
// one by one, and the page scrolls down, the lower cards popping in as they come
// into view.
// Positions come from projects/sgcards/layout.js (written by
// capture/sgcards-capture.mjs); the pieces are that script's captures.
(() => {
  const LAYOUT = window.SGCARDS_LAYOUT;
  if (!LAYOUT) return;
  const BASE = "projects/sgcards/"; // images are referenced from the page at the site root
  const VER = LAYOUT.version ? `?v=${LAYOUT.version}` : ""; // a new capture gets new image addresses
  const ZOOM = .45; // a flying card starts 45% larger than its real size

  const VIEWS = {
    // a 1390 × 860 browser, the same size as the Aislelys browsers
    desk: {
      W: 1472, H: 1024, scale: .8, kind: "browser", bar: 84, url: "sgcards.online", // 84: the Chrome bar
      rect: [40, 40, 1392, 944], cw: 1390, ch: 860, ox: 41, oy: 125, round: 17,
      L: LAYOUT.desk, step: .022, // one card starts every 2.2% of the scroll
      gap: 1440, small: 1, // carousel: one browser width + 48 between them
      from: (col) => [[-760, -140, -12], [-460, -460, -8], [0, -640, 5], [460, -460, 8], [760, -140, 12]][col],
    },
    mob: {
      // the owner's phone image, with its own status bar; the 390 × 797 page area
      // starts below it, at (65.47, 134.86)
      W: 562, H: 1015.8, scale: 1.01, kind: "phone",
      rect: [20, 20, 522, 975.8], cw: 390, ch: 797, ox: 85.47, oy: 154.86, round: 58,
      L: LAYOUT.mob, step: .045,
      gap: 424, small: .85, // as in the other phone carousels
      from: (col) => [[-460, -80, -12], [460, -80, 12]][col],
    },
  };

  const stage = document.getElementById("sg-stage"), scaler = document.getElementById("sg-scaler");
  const track = document.getElementById("sg-track"), hero = document.getElementById("sg-hero"), hint = document.getElementById("sg-hint");
  // Pacing (owner's request): 1 scroll to the locations; 1 for the store cards to
  // fly in at mid speed; 2 for the popup (open, then More Info); 1 to slide to the
  // Articles page; 2 for the articles.
  // The headline holds for the first half scroll (owner's request: a brief pause on the title).
  // Articles: its first row pops in, then the story ends (owner's request: the last
  // step — the scroll to the second row — is cut so the next project comes sooner).
  const PACE = [[0, 0], [0.5, 0], [1.5, .125], [2.5, .315], [3.5, .38], [4.5, .5], [5.5, .62], [6.5, .74]];
  window.pace(track, PACE);
  // "Visit live site" under the window (shared/live.js)
  const live = window.liveLink(document.getElementById("sg-hint").parentElement, { href: "https://sgcards.online", icon: "shared/favicons/sgcards.png", name: "SG Cards" });
  const view = (n) => (n === "desk" ? "desk" : "mob");

  const SIDE = .55; // carousel: opacity of the frame peeking at the side
  let V = null, win, frame, pg, bar, fly, bezel = null, cards = [], dim, sideF, sideB, close, win2, pg2, bar2, arts = [], artScroll = 0;

  // a frame (Chrome window or phone) around `content`
  function makeFrame(content, url) {
    const [fx, fy, fw, fh] = V.rect;
    const el = document.createElement("div");
    if (V.kind === "browser") {
      el.className = "browser";
      el.innerHTML = `${window.chromeBar({ active: "sgcards", url })}${content}`; // a Chrome window (shared/chrome.js)
    } else {
      el.className = "phone";
      el.innerHTML = `<div class="scr"><div class="sb"><span>9:41</span><i><b style="height:5px"></b><b style="height:7px"></b><b style="height:9px"></b><b style="height:11px"></b></i></div>${content}</div><div class="island"></div><div class="homebar"></div>`;
    }
    Object.assign(el.style, { left: fx + "px", top: fy + "px", width: fw + "px", height: fh + "px" });
    return el;
  }
  function makeWin() {
    const [fx, fy, fw, fh] = V.rect;
    const w = document.createElement("div");
    w.className = "win";
    Object.assign(w.style, { width: V.W + "px", height: V.H + "px", transformOrigin: `${fx + fw / 2}px ${fy + fh / 2}px` });
    return w;
  }

  // Screen 2: the Articles page, its cards on top of the captured page
  function buildArticles(pre) {
    const A = V.L.art;
    win2 = makeWin();
    const cardsHtml = A.cards.map((c, i) => `<div class="art" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;opacity:0"><img src="${pre}-art-card-${i}.png${VER}" alt="${c.title.replace(/"/g, "&quot;")}" decoding="async"></div>`).join("");
    const content = `<div class="content" style="left:0;top:${V.kind === "browser" ? V.bar : 47}px;width:${V.cw}px;height:${V.ch}px">
        <div class="pg"><img src="${pre}-art.jpg${VER}" alt="SG Cards articles page" decoding="async">${cardsHtml}</div>
        <img class="topbar" src="${pre}-art-bar.png${VER}" alt="" style="height:${A.barH}px">
      </div>`;
    const f = makeFrame(content, "sgcards.online/articles");
    win2.append(f);
    pg2 = f.querySelector(".pg");
    bar2 = f.querySelector(".topbar");
    // the scroll stops once the second row of articles is fully in view, before
    // the third shows (owner's request; on the phone a row is one article)
    const rows = [...new Set(A.cards.map((c) => Math.round(c.y)))].sort((a, b) => a - b);
    const row2 = A.cards.filter((c) => Math.round(c.y) === rows[Math.min(1, rows.length - 1)]);
    artScroll = Math.max(0, Math.min(A.scroll, Math.max(...row2.map((c) => c.y + c.h)) + 24 - V.ch));
    // when each card pops: the ones already on screen one after another, the rest
    // as the scroll brings them into view (cards the scroll never reaches stay hidden)
    let n = 0;
    arts = [...f.querySelectorAll(".art")].map((el, i) => {
      const c = A.cards[i];
      const enter = c.y + 140 - V.ch; // scroll at which it comes into view
      const at = enter <= 0 ? .06 + (n++) * .06 : enter <= artScroll ? .35 + .55 * (enter / Math.max(1, artScroll)) : 2;
      return { el, at };
    });
    stage.append(win2);
  }
  function build(name) {
    if (V === VIEWS[name]) return;
    V = VIEWS[name];
    const L = V.L, pre = BASE + "img/" + view(name);
    stage.replaceChildren();
    stage.style.width = V.W + "px"; stage.style.height = V.H + "px";
    win = makeWin();

    // the frame and the page inside it
    const content = `<div class="content" style="left:0;top:${V.kind === "browser" ? V.bar : 47}px;width:${V.cw}px;height:${V.ch}px">
        <div class="pg"><img src="${pre}-page.jpg${VER}" alt="SG Cards home page" decoding="async"></div>
        <img class="topbar" src="${pre}-bar.png${VER}" alt="" style="height:${L.barH}px">
      </div>`;
    frame = makeFrame(content, V.url);
    pg = frame.querySelector(".pg");
    bar = frame.querySelector(".topbar");
    win.append(frame);

    // the store cards: they fly in from the sides and the top, and are cut off
    // only at the bottom edge of the window (where the page continues)
    fly = document.createElement("div");
    fly.className = "fly";
    Object.assign(fly.style, { left: V.ox + "px", top: V.oy + "px", width: V.cw + "px", height: V.ch + "px", clipPath: `inset(-3000px -3000px 0 -3000px round 0 0 ${V.round}px ${V.round}px)` });
    const cols = [...new Set(L.cards.map((c) => Math.round(c.x)))].sort((a, b) => a - b);
    cards = L.cards.map((c, i) => {
      const el = document.createElement("div");
      el.className = "card";
      Object.assign(el.style, { left: c.x + "px", top: c.y - L.scroll + "px", width: c.w + "px", height: c.h + "px", opacity: 0 });
      el.innerHTML = `<img src="${pre}-card-${i}.png${VER}" alt="${c.name}" decoding="async">`;
      fly.append(el);
      return { el, from: V.from(cols.indexOf(Math.round(c.x))) };
    });
    win.append(fly);

    // the popup layer: dimmed page, the card (front, then its More Info side), close button
    const pop = document.createElement("div");
    pop.className = "pop";
    Object.assign(pop.style, { left: V.ox + "px", top: V.oy + "px", width: V.cw + "px", height: V.ch + "px", borderRadius: `0 0 ${V.round}px ${V.round}px` });
    const P = L.pop;
    const side = (src, [x, y, w, h]) => `<img class="side" src="${src}" alt="" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;opacity:0">`;
    pop.innerHTML = `<div class="dim" style="opacity:0"></div>${side(pre + "-pop-front.png" + VER, P.front)}${side(pre + "-pop-back.png" + VER, P.back)}
      <div class="close" style="left:${P.close[0]}px;top:0;opacity:0"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></div>`;
    [sideF, sideB] = pop.querySelectorAll(".side");
    dim = pop.querySelector(".dim");
    close = pop.querySelector(".close");
    win.append(pop);
    bezel = window.addBezel(win, V); // the phone comes in front once the store cards have landed
    buildArticles(pre);
    stage.append(win); // screen 1 on top while the two overlap
  }

  // a phone-shaped screen gets the phone; anything wider gets the browser
  function fit() {
    build(innerWidth < 700 || innerWidth / innerHeight < .75 ? "mob" : "desk");
    const s = Math.min(innerWidth / V.W, innerHeight / V.H) * V.scale;
    scaler.style.transform = `scale(${s}) translate(${-V.W / 2}px, ${-V.H / 2}px)`;
    window.placeLive(live, V, s);
    // "What you just watched" sits close to the window, as in the other stories
    const after = document.getElementById("sg-after");
    after.style.marginTop = "0px";
    const below = innerHeight / 2 - (V.rect[1] + V.rect[3] - V.H / 2) * s;
    const gap = below + parseFloat(getComputedStyle(after).paddingTop);
    after.style.marginTop = `${-Math.round(gap * (V === VIEWS.desk ? .45 : .25))}px`;
  }

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (v, a, b) => clamp((v - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t) => t * t * t;
  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
  const easeIO = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const back = (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  let target = 0, cur = 0, raf = 0, flipAt = null, flipping = false;
  const FLY_S = .6; let flying = false, snap = true; // store cards: landing time; snap = land at once (load / jump)
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  function readScroll() {
    const r = track.getBoundingClientRect();
    target = window.paceT(-r.top / innerHeight, PACE);
    if (!raf) raf = requestAnimationFrame(draw);
  }

  function draw() {
    raf = 0;
    cur += (target - cur) * (still.matches ? 1 : .14);
    if (Math.abs(target - cur) < .0004) cur = target;
    const T = cur, L = V.L;
    const T1 = clamp(T / .5); // screen 1 plays over the first half of the track

    // at rest: only the headline; the browser rises as soon as the visitor scrolls
    const h = easeOut(prog(T1, .005, .05));
    hero.style.opacity = 1 - h;
    hero.style.transform = `translateY(${-h * 60}px)`;
    hint.style.opacity = 1 - prog(T1, 0, .015);
    const b = easeOutQuint(prog(T1, .02, .085));

    // the carousel: the Articles page peeks in on the right, then the row slides left to it
    const appear = easeOut(prog(T, .47, .51)), cp = easeIO(prog(T, .53, .61));
    const sideOp = (d) => 1 - (1 - SIDE) * Math.min(d, 1), size = (d) => 1 - (1 - V.small) * Math.min(d, 1);
    win.style.opacity = b * sideOp(cp);
    
    live.style.opacity = b;
    if (live.mark && !live.mark.classList.contains("in-hero")) live.mark.style.opacity = live.style.opacity; // the wordmark above the window (desktop)
    win.style.transform = `translate(${-cp * V.gap}px, ${(1 - b) * 90}px) scale(${(.96 + .04 * b) * size(cp)})`;
    const shown2 = cp > 0 ? 1 : appear;
    win2.style.opacity = sideOp(1 - cp) * shown2;
    win2.style.visibility = shown2 < .005 ? "hidden" : "visible";
    win2.style.transform = `translate(${(1 - cp) * V.gap + V.gap * .3 * (1 - shown2)}px, 0px) scale(${size(1 - cp)})`;

    // 2. scroll down to "Select Location"
    const sy = easeIO(prog(T1, .11, .24)) * L.scroll;
    pg.style.transform = `translateY(${-sy}px)`;
    bar.classList.toggle("stuck", sy > 2);

    // 3. every store card in view flies in, one after another
    // the cards fly over the phone; once the last has landed the phone comes to the front
    // Each card's start is set by the scroll, but once started it finishes landing by
    // itself (FLY_S seconds), so stopping mid-scroll never leaves a card half-landed
    // (owner's report: Cardboard Crack sat higher than Battle Bunker). Scrolling back
    // above a card's start sends it away again.
    const now = performance.now();
    let landed = 0;
    flying = false;
    cards.forEach((c, i) => {
      const { el, from } = c;
      const a = .26 + i * V.step;
      if (T1 < a) c.at = null;
      else if (c.at == null) c.at = snap || still.matches ? now - FLY_S * 1000 : now;
      const k = c.at == null ? 0 : clamp((now - c.at) / (FLY_S * 1000));
      if (k >= 1) landed++; else if (c.at != null) flying = true;
      const f = 1 - easeOutQuint(k);
      el.style.opacity = k <= 0 ? 0 : Math.min(1, k * 5);
      el.style.transform = `translate(${from[0] * f}px, ${from[1] * f}px) rotate(${from[2] * f}deg) scale(${1 + ZOOM * f})`;
      el.style.boxShadow = f > .01 ? `0 ${(40 * f).toFixed(0)}px ${(60 * f).toFixed(0)}px -18px rgba(17,17,17,${(.26 * f).toFixed(3)})` : "";
    });
    snap = false;
    // the cards fly over the phone; once the last has landed the phone comes to the front
    if (bezel) bezel.style.opacity = cards.length && landed === cards.length ? 1 : 0;

    // 4. the popup opens over the dimmed page (as on the site: fade + a small spring)
    // the site blurs the page 4 px behind its popup; the page and the cards are
    // blurred directly (a backdrop blur misdraws inside the scaled frame)
    const kd = easeOut(prog(T1, .64, .69));
    dim.style.opacity = kd;
    const blur = kd > .001 ? `blur(${(4 * kd).toFixed(2)}px)` : "";
    frame.querySelector(".content").style.filter = blur;
    fly.style.filter = blur;
    const kp = prog(T1, .66, .72);
    // 5. ...and flips over to its "More Info" side
    // ...and turns over to its "More Info" side by itself, 0.3 s after it has opened
    // (owner's request); it turns back if the visitor scrolls back up
    if (kp >= 1) { if (flipAt === null) flipAt = performance.now(); } else flipAt = null;
    const fs = flipAt === null ? 0 : still.matches ? 99 : (performance.now() - flipAt) / 1000;
    flipping = flipAt !== null && fs < .8;
    const k1 = prog(fs, .3, .5), k2 = prog(fs, .5, .7);
    sideF.style.opacity = k1 >= 1 ? 0 : Math.min(1, kp * 3);
    sideF.style.transform = `translateY(${(1 - easeOut(kp)) * 20}px) scale(${.97 + .03 * back(kp)}) rotateY(${-90 * easeIn(k1)}deg)`;
    sideB.style.opacity = k2 > 0 ? 1 : 0;
    sideB.style.transform = `rotateY(${90 * (1 - easeOut(k2))}deg)`;
    // the close button sits 14 px under whichever side is showing
    const sideBox = k2 > 0 ? L.pop.back : L.pop.front;
    close.style.opacity = Math.min(1, prog(T1, .69, .72) * 1);
    close.style.transform = `translateY(${sideBox[1] + sideBox[3] + 14}px)`;

    // ---- screen 2: the article cards pop in, then the page scrolls down to the last one
    const T2 = prog(T, .62, .98);
    const ay = easeIO(prog(T2, .35, .9)) * artScroll;
    pg2.style.transform = `translateY(${-ay}px)`;
    bar2.classList.toggle("stuck", ay > 2);
    arts.forEach(({ el, at }) => {
      const k = prog(T2, at, at + .08);
      el.style.opacity = Math.min(1, k * 2.2);
      el.style.transform = `translateY(${(1 - easeOut(k)) * 18}px) scale(${.9 + .1 * back(k)})`;
    });

    if (cur !== target || flipping || flying) raf = requestAnimationFrame(draw);
  }

  addEventListener("scroll", readScroll, { passive: true });
  // the project indicator jumps straight here: settle at once, no replay in between
  addEventListener("pf:jump", () => { readScroll(); cur = target; snap = true; draw(); });
  addEventListener("resize", () => { fit(); cur = target; readScroll(); draw(); });
  fit(); readScroll(); cur = target; draw();
})();
