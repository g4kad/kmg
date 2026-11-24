// Deqly story: scroll engine + content. Runs inside #deqly.
// Screen 1 (owner's choice): the landing page. Only the hero card stack moves:
//   1. the browser rises on the landing page, the hero's right side empty;
//   2. the three cards fly in one by one, zooming down to size, and land
//      stacked on the front card's spot;
//   3. they fan out to where the site shows them (on the phone the back two
//      turn ±15° from their bottom edge, as on the site);
//   4. on desktop the three small icons pop in around them;
//   5. the page scrolls down to "Where your story takes shape" (owner's request),
//      the cards scrolling up with it, under the site's fixed top bar.
// Screen 2 (owner's request): "There is more to you than a card can say" and its
// interaction. It peeks in on the right (dimmed; 15% smaller on the phone) and the
// row slides left to it. The page scrolls from the heading to the cards, then
//   - desktop: each card is tapped and flips through its deck, one card at a time
//     (the site flips by squeezing the card to nothing and back: scaleX 1 → 0 → 1);
//   - phone: a finger drags the swipe strip from one card to the next, twice,
//     the dots following, as on the site.
// Positions come from projects/deqly/layout.js (capture/deqly-capture.mjs).
(() => {
  const LAYOUT = window.DEQLY_LAYOUT;
  if (!LAYOUT) return;
  const BASE = "projects/deqly/"; // images are referenced from the page at the site root
  const VER = LAYOUT.version ? `?v=${LAYOUT.version}` : "";
  const ZOOM = .45; // a flying card starts 45% larger than its real size

  const VIEWS = {
    // a Chrome window (shared/chrome.js) 1390 × 860, the same size as Aislelys / SG Cards
    desk: {
      W: 1472, H: 1024, scale: .8, kind: "browser", bar: 84, url: "deqly.com",
      rect: [40, 40, 1392, 944], cw: 1390, ch: 860, ox: 41, oy: 125,
      L: LAYOUT.desk, gap: 1440, small: 1, // carousel: one browser width + 48 between them
      // back card from the right, middle from the top, front from the bottom left
      from: { "Card-03.png": [620, -260, 16], "Card-02.png": [300, -520, 10], "Card-01.png": [-260, 520, -12] },
    },
    // the owner's phone image; the 390 × 797 page area starts at (65.47, 134.86)
    mob: {
      W: 562, H: 1015.8, scale: 1.01, kind: "phone",
      rect: [20, 20, 522, 975.8], cw: 390, ch: 797, ox: 85.47, oy: 154.86,
      L: LAYOUT.mob, gap: 424, small: .85, // as in the other phone carousels
      from: { "Card-03.png": [340, -220, 16], "Card-02.png": [180, -360, 10], "Card-01.png": [-160, 380, -12] },
    },
  };

  const stage = document.getElementById("dq-stage"), scaler = document.getElementById("dq-scaler");
  const track = document.getElementById("dq-track"), hero = document.getElementById("dq-hero"), hint = document.getElementById("dq-hint");
  // Pacing (owner's request): 1 scroll brings the cards in (and fans them out),
  // 1 brings the other elements in, 1 to "Where your story takes shape"; then 1 to
  // slide to screen 2 and 2 for its tap-to-flip / drag.
  // The cards at the end get a little friction (owner's request): 2.6 scrolls, not 2.
  // The headline holds for the first half scroll (owner's request: a brief pause on the title).
  // Screen 2 has one flip per card / one drag (owner's request: the last step — the
  // second flip / drag — is cut so the story ends sooner); 1.6 scrolls, not 2.6.
  const PACE = [[0, 0], [0.5, 0], [1.5, .32], [2.5, .385], [3.5, .5], [4.5, .635], [6.1, 1]];
  window.pace(track, PACE);
  // "Visit live site" under the window (shared/live.js)
  const live = window.liveLink(document.getElementById("dq-hint").parentElement, { href: "https://deqly.com", icon: "shared/favicons/deqly.png?v=2", name: "Deqly" });

  // The site's phone layout has no floating icons; the owner asked for them on the
  // phone too. They are placed around the phone's front card the way they sit
  // around the desktop's, scaled to the smaller card.
  function phoneIcons(L) {
    if (L.pieces.some((p) => p.src.startsWith("Small-Icon"))) return [];
    const front = (pcs) => pcs.find((p) => p.src === "Card-01.png");
    const d = front(LAYOUT.desk.pieces), m = front(L.pieces);
    const k = m.w / d.w;
    return LAYOUT.desk.pieces.filter((p) => p.src.startsWith("Small-Icon")).map((p) => ({
      ...p, x: m.x + (p.x - d.x) * k, y: m.y + (p.y - d.y) * k, w: p.w * k, h: p.h * k,
    }));
  }

  const SIDE = .55; // carousel: opacity of the frame peeking at the side
  let V = null, win, win2, pg, pg2, layer, bezel = null, cards = [], icons = [], flips = [], strip = null, touch;

  // A frame (browser or phone) with a page inside, under the site's fixed top bar.
  function makeFrame(name, inner) {
    const [fx, fy, fw, fh] = V.rect;
    const frame = document.createElement("div");
    const content = `<div class="content" style="left:0;top:${V.kind === "browser" ? V.bar : 47}px;width:${V.cw}px;height:${V.ch}px">
        ${inner}
        <img class="topbar" src="${BASE}img/${name}-bar.png${VER}" alt="" style="height:${V.L.navH}px">
      </div>`;
    if (V.kind === "browser") {
      frame.className = "browser";
      frame.innerHTML = `${window.chromeBar({ active: "deqly", url: V.url })}${content}`;
    } else {
      frame.className = "phone";
      frame.innerHTML = `<div class="scr"><div class="sb"></div>${content}</div><div class="island"></div><div class="homebar"></div>`;
    }
    Object.assign(frame.style, { left: fx + "px", top: fy + "px", width: fw + "px", height: fh + "px" });
    return frame;
  }
  function makeWin() {
    const [fx, fy, fw, fh] = V.rect;
    const w = document.createElement("div");
    w.className = "win" + (V.kind === "phone" ? " mob" : "");
    Object.assign(w.style, { width: V.W + "px", height: V.H + "px", transformOrigin: `${fx + fw / 2}px ${fy + fh / 2}px` });
    return w;
  }

  // Screen 2: the "There is more to you than a card can say" section.
  function buildShow(name) {
    const S = V.L.show, pre = BASE + "img/", a = S.a;
    win2 = makeWin();
    let inner = `<div class="pg"><img src="${pre}${name}-show.jpg${VER}" alt="Deqly: There is more to you than a card can say" decoding="async">`;
    if (!S.strip) {
      // desktop: the three cards, each with its deck of three
      inner += S.cards.map((c, i) => `<img class="scard" data-i="${i}" src="${pre}${c.frames[0]}${VER}" alt="" style="left:${c.box[0]}px;top:${c.box[1] - a}px;width:${c.box[2]}px;height:${c.box[3]}px">`).join("");
    } else {
      // phone: the swipe strip (one card at a time) and its dots
      const { clip, slide, gap, slides, dots } = S.strip;
      inner += `<div class="strip" style="left:${clip[0]}px;top:${clip[1] - a}px;width:${clip[2]}px;height:${clip[3]}px"><div class="strack">` +
        slides.map((src, i) => `<div class="slide" style="left:${slide[0] - clip[0] + i * (slide[2] + gap)}px;top:${slide[1] - clip[1]}px;width:${slide[2]}px;height:${slide[3]}px"><img src="${pre}${src}${VER}" alt=""></div>`).join("") +
        `</div></div>` +
        dots.map((d, i) => `<i class="sdot" style="left:${d[0] + d[2] / 2 - 3.5}px;top:${d[1] + d[3] / 2 - 3.5 - a}px"></i>`).join("");
    }
    inner += `<div class="touch"><i></i></div></div>`;
    const frame = makeFrame(name, inner);
    win2.append(frame);
    pg2 = frame.querySelector(".pg");
    touch = frame.querySelector(".touch");
    flips = [...frame.querySelectorAll(".scard")].map((el, i) => ({ el, card: S.cards[i], shown: 0 }));
    strip = S.strip ? { ...S.strip, track: frame.querySelector(".strack"), dots: [...frame.querySelectorAll(".sdot")] } : null;
    stage.append(win2);
  }
  function build(name) {
    if (V === VIEWS[name]) return;
    V = VIEWS[name];
    const L = V.L, pre = BASE + "img/";
    stage.replaceChildren();
    stage.style.width = V.W + "px"; stage.style.height = V.H + "px";
    win = makeWin();
    // the frame and the captured page inside it
    const frame = makeFrame(name, `<div class="pg"><img src="${pre}${name}-page.jpg${VER}" alt="Deqly landing page" decoding="async"></div>`);
    win.append(frame);
    pg = frame.querySelector(".pg");

    // the card stack and icons, in the page's own coordinates
    layer = document.createElement("div");
    layer.className = "pieces";
    Object.assign(layer.style, { left: V.ox + "px", top: V.oy + "px", width: V.cw + "px", height: V.ch + "px" });
    const pcs = [...L.pieces, ...phoneIcons(L)].sort((a, b) => a.z - b.z);
    const front = pcs.find((p) => p.src === "Card-01.png");
    const fc = [front.x + front.w / 2, front.y + front.h / 2];
    cards = []; icons = [];
    for (const p of pcs) {
      const img = document.createElement("img");
      const isCard = p.src.startsWith("Card-");
      img.className = "piece " + (isCard ? "card" : "icon") + (p === front ? " front" : "");
      img.src = pre + p.src + VER;
      img.alt = "";
      Object.assign(img.style, { left: p.x + "px", top: p.y + "px", width: p.w + "px", height: p.h + "px", opacity: 0, transformOrigin: isCard && p.angle ? `${p.w / 2}px ${p.h}px` : "50% 50%" });
      layer.append(img);
      // where it lands first (stacked on the front card) relative to its own place
      const stack = [fc[0] - (p.x + p.w / 2), fc[1] - (p.y + p.h / 2)];
      (isCard ? cards : icons).push({ el: img, p, stack, from: V.from[p.src] });
    }
    win.append(layer);
    bezel = window.addBezel(win, V); // the phone comes in front once the cards and icons have landed
    buildShow(name);
    stage.append(win); // screen 1 on top while the two overlap
  }

  // a phone-shaped screen gets the phone; anything wider gets the browser
  function fit() {
    build(innerWidth < 700 || innerWidth / innerHeight < .75 ? "mob" : "desk");
    const s = Math.min(innerWidth / V.W, innerHeight / V.H) * V.scale;
    scaler.style.transform = `scale(${s}) translate(${-V.W / 2}px, ${-V.H / 2}px)`;
    window.placeLive(live, V, s);
    const after = document.getElementById("dq-after");
    after.style.marginTop = "0px";
    const below = innerHeight / 2 - (V.rect[1] + V.rect[3] - V.H / 2) * s;
    const gap = below + parseFloat(getComputedStyle(after).paddingTop);
    after.style.marginTop = `${-Math.round(gap * (V === VIEWS.desk ? .45 : .25))}px`;
  }

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (v, a, b) => clamp((v - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
  const easeIO = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const back = (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  let target = 0, cur = 0, raf = 0, played = 0, lastT = null, stepping = false, snapSteps = false;
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
    const T = cur;
    const T1 = clamp(T / .5); // screen 1 plays over the first half of the track

    // at rest: only the headline; the browser rises as soon as the visitor scrolls
    const h = easeOut(prog(T1, .005, .06));
    hero.style.opacity = 1 - h;
    hero.style.transform = `translateY(${-h * 60}px)`;
    hint.style.opacity = 1 - prog(T1, 0, .02);
    const b = easeOutQuint(prog(T1, .02, .10));

    // the carousel: screen 2 peeks in on the right, then the row slides left to it
    const appear = easeOut(prog(T, .49, .53)), p = easeIO(prog(T, .55, .63));
    const sideOp = (d) => 1 - (1 - SIDE) * Math.min(d, 1), size = (d) => 1 - (1 - V.small) * Math.min(d, 1);
    win.style.opacity = b * sideOp(p);
    
    live.style.opacity = b;
    if (live.mark && !live.mark.classList.contains("in-hero")) live.mark.style.opacity = live.style.opacity; // the wordmark above the window (desktop)
    win.style.transform = `translate(${-p * V.gap}px, ${(1 - b) * 90}px) scale(${(.96 + .04 * b) * size(p)})`;
    const shown2 = p > 0 ? 1 : appear;
    win2.style.opacity = sideOp(1 - p) * shown2;
    win2.style.visibility = shown2 < .005 ? "hidden" : "visible";
    win2.style.transform = `translate(${(1 - p) * V.gap + V.gap * .3 * (1 - shown2)}px, 0px) scale(${size(1 - p)})`;

    // the cards fly in (back card first), land stacked, then fan out
    const fan = easeIO(prog(T1, .52, .64));
    cards.forEach(({ el, p, stack, from }, i) => {
      const a = .16 + i * .09;
      const k = prog(T1, a, a + .16);
      const f = 1 - easeOutQuint(k);
      const sx = stack[0] * (1 - fan), sy = stack[1] * (1 - fan); // stacked → own place
      el.style.opacity = k <= 0 ? 0 : Math.min(1, k * 5);
      el.style.transform = `translate(${sx + from[0] * f}px, ${sy + from[1] * f}px) rotate(${from[2] * f + p.angle * fan}deg) scale(${1 + ZOOM * f})`;
    });
    // the floating icons pop in around the fanned cards
    // the cards and icons fly over the phone; once all have landed it comes to the front
    if (bezel) bezel.style.opacity = T1 >= .64 + (icons.length - 1) * .03 + .06 ? 1 : 0;
    icons.forEach(({ el }, i) => {
      const k = prog(T1, .64 + i * .03, .70 + i * .03);
      el.style.opacity = Math.min(1, k * 2.2);
      el.style.transform = `translateY(${(1 - easeOut(k)) * 14}px) scale(${.4 + .6 * back(k)})`;
    });

    // 5. scroll down to "Where your story takes shape"; the cards go with the page,
    // clipped under the fixed top bar (only while scrolling, so they can still fly
    // in from outside the window before)
    const sy = easeIO(prog(T1, .78, .95)) * V.L.scroll;
    pg.style.transform = `translateY(${-sy}px)`;
    layer.style.transform = `translateY(${-sy}px)`;
    layer.style.clipPath = sy > .5 ? `inset(${V.L.navH + sy}px -3000px -3000px -3000px)` : "";

    // ---- screen 2: from the heading down to the cards, then the interaction
    const T2 = prog(T, .64, .98), S = V.L.show;
    pg2.style.transform = `translateY(${-easeIO(prog(T2, .02, .16)) * (S.b - S.a)}px)`;
    let tx = 0, ty = 0, press = 0, vis = 0;
    // The scroll only decides how many flips / drags should have happened; they
    // then play one at a time at their own pace, so a quick scroll queues them up
    // instead of jumping past the middle card (owner's report: it skipped).
    const marks = strip ? [.45] : [.25, .5, .75]; // one drag / one flip per card
    const want = marks.filter((m) => T2 >= m).length;
    const now = performance.now(), dt = lastT === null ? 0 : Math.min(.1, (now - lastT) / 1000);
    const DUR = strip ? .65 : .55; // seconds per drag / per flip
    if (still.matches || snapSteps) { played = want; snapSteps = false; }
    else if (played < want) played = Math.min(want, played + dt / DUR);
    else if (played > want) played = Math.max(want, played - dt / DUR);
    stepping = played !== want;
    lastT = stepping ? now : null;
    const local = (n) => clamp(played - n); // 0 → 1 through step n
    if (!strip) {
      // desktop: tap each card in turn; it flips to the next card of its deck once
      // (the site's flip: squeeze to nothing, swap, open again)
      flips.forEach((f, i) => {
        let frame = 0, sx = 1;
        for (let j = 0; j < 1; j++) {
          const k = local(i + j);
          if (k >= .5) frame = j + 1;
          if (k > 0 && k < 1) {
            sx = Math.abs(1 - 2 * easeIO(k));
            const [x, y, w, h] = f.card.box;
            tx = x + w * .55; ty = y - S.a + h * .45; vis = Math.sin(Math.PI * k); press = k < .5 ? 1 : 0;
          }
        }
        if (f.shown !== frame) { f.shown = frame; f.el.src = BASE + "img/" + f.card.frames[frame] + VER; }
        f.el.style.transform = `scaleX(${sx})`;
      });
    } else {
      // phone: a finger drags the strip from one card to the next, twice
      const step = strip.slide[2] + strip.gap;
      const d1 = local(0), d2 = local(1);
      const pos = easeIO(d1) + easeIO(d2);
      strip.track.style.transform = `translateX(${-pos * step}px)`;
      const active = Math.round(pos);
      strip.dots.forEach((d, i) => d.classList.toggle("on", i === active));
      for (const d of [d1, d2]) {
        if (d > 0 && d < 1) {
          const [x, y, w, h] = strip.slide;
          tx = x + w * (.78 - .56 * easeIO(d)); ty = y - S.a + h * .5; vis = Math.min(1, Math.sin(Math.PI * d) * 2); press = 1;
        }
      }
    }
    touch.style.opacity = vis;
    touch.style.transform = `translate(${tx}px, ${ty}px) scale(${1 - .18 * press})`;

    if (cur !== target || stepping) raf = requestAnimationFrame(draw);
  }

  addEventListener("scroll", readScroll, { passive: true });
  // the project indicator jumps straight here: settle at once, no replay in between
  addEventListener("pf:jump", () => { readScroll(); cur = target; snapSteps = true; draw(); });
  addEventListener("resize", () => { fit(); cur = target; readScroll(); draw(); });
  fit(); readScroll(); cur = target; draw();
})();
