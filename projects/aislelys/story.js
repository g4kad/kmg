// Aislelys story: scroll engine + content. Runs inside #aislelys.
(() => {
  const BASE = "projects/aislelys/"; // images are referenced from the page at the site root
  // ---- icons -------------------------------------------------------------
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
    wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  };
  const I = (k) => `<svg class="i" viewBox="0 0 24 24">${P[k]}</svg>`;
  const CHEV = '<svg viewBox="0 0 16 16"><path d="M6 3.5 10.5 8 6 12.5"/></svg>';
  const CHECK = '<svg class="ck" viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  const RING = '<svg class="ring" viewBox="0 0 16 16"><circle cx="8" cy="8" r="4.6"/></svg>';
  // Desktop browsers are 1390 px wide (the size the owner's own screenshots use);
  // the app keeps its 1132 px column centred, so desktop content sits DX in.
  const DX = 95;
  const at = (x, y, w, h, cls, html, extra = "") => `<div class="at ${cls}" style="left:${x}px;top:${y}px;${w ? `width:${w}px;` : ""}${h ? `height:${h}px;` : ""}${extra}">${html}</div>`;

  // ---- sample data (invented: the Mira & Theo test couple) ---------------
  const NEWLY = [
    ["#C97B63", "Florist meeting", "1/2", "03/12/26 · 4:00 PM"],
    ["#AD9CA6", "Send save-the-dates", "1/3", "20/12/26"],
    ["#7C9885", "Pre-wedding shoot", "0/2", "17/01/27 · 8:00 AM"],
  ];
  const COMING = [
    ["#E0A6A1", "Second visit to the garden venue", "1/3", "29/11/26 · 10:00 AM"],
    ["#C97B63", "Florist meeting", "1/2", "03/12/26 · 4:00 PM"],
    ["#C97B63", "Cake tasting", "2/2", "06/12/26 · 2:30 PM"],
  ];
  const BUDGET = { total: 40000, savings: 28500, spent: 24500 };
  const CATS = [
    ["Venue", "#E0A6A1", [["Garden venue", 14000, true, "Includes the garden hall until 11 pm."], ["Long-table rentals", 1650, false, "Twelve tables, linen included."]]],
    ["Photography", "#7C9885", [["Wedding-day photographer", 3600, true, "Full day, two shooters."], ["Pre-wedding shoot", 0, false, "Waiting on the final quote."]]],
    ["Attire", "#B99767", [["Wedding dress", 2450, true, "Second fitting on 13 Dec."], ["Theo's suit", 880, false, ""]]],
    ["Decorations", "#C97B63", [["Bridal bouquet & centrepieces", 1380, false, "Ivory roses and eucalyptus."], ["Candles & table settings", 540, true, ""]]],
  ];
  const SUBTASKS = [["Confirm the time", "M", "#7C514F"], ["List rain-plan questions", "T", "#AD9CA6"], ["Measure the terrace", "T", "#AD9CA6"]];
  const money = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const taskList = (rows) => `<ul class="tl">${rows.map(([c, t, p, d]) => `<li><span class="dot" style="background:${c}"></span><span class="tt">${t}</span><span class="tp">${p}</span><span class="td">${d}</span></li>`).join("")}</ul>`;
  const panel = (title, link, rows) => `<div class="ph"><h2>${title}</h2><a>${link} →</a></div>${taskList(rows)}`;
  const cell = (label, value, cls = "") => `<span class="bl">${label}</span><span class="bv${cls}">${value}</span>`;
  const CELLS = [
    ["Total budget", `$ ${money(40000)}`, ""],
    ["Total savings", `$ ${money(28500)}`, ""],
    ["Remaining (SGD)", `$ ${money(15500)}`, " pos"],
    ["Total (SGD)", `$ ${money(24500)}`, ""],
  ];
  const NAV = [["home", "Overview"], ["cal", "Planner"], ["users", "Guest List"], ["wallet", "Budget"], ["", "Vendors"], ["", "Inspiration"], ["", "Our Big Day"]];

  // The app header, desktop or phone. `active` names the highlighted tab.
  function header(m, active) {
    const tabs = NAV.map(([ic, l]) => `<span${l === active ? ' class="on"' : ""}>${m && ic ? I(ic) : ""}${l}</span>`).join("");
    return m
      ? `<div class="hdr" style="height:185px"></div>${at(20, 42, 0, 0, "ttl", "M &amp; T's Wedding")}${at(20, 78, 0, 0, "sub", "203 days till the big day!")}${at(338, 42, 32, 32, "avatar", "M")}${at(20, 115, 350, 45, "nav", tabs)}`
      : `<div class="hdr" style="height:118px"></div>${at(DX, 0, 1200, 118, "", `${at(34, 32, 0, 0, "ttl", "M &amp; T's Wedding")}${at(34, 68, 0, 0, "sub", "203 days till the big day!")}${at(351, 39, 767, 47, "nav", tabs)}${at(1134, 46, 32, 32, "avatar", "M")}`)}`;
  }
  function overviewHero(m) {
    return m
      ? at(20, 213, 350, 393, "ohero", `
          ${at(0, 24, 350, 72, "days", "203", "font-size:72px;line-height:72px")}
          ${at(0, 98, 350, 19, "dlab", "Days to go")}
          ${at(20, 129, 310, 71, "rom m2", "<b>ROM</b><em>Saturday, 20 March 2027</em><span>119 days to go</span>")}
          ${at(22, 221, 307, 0, "quote sm", "<blockquote>“The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves.”</blockquote><figcaption>— Victor Hugo</figcaption>")}`)
      : at(34 + DX, 146, 1132, 308, "ohero", `
          ${at(0, 48, 566, 136, "days", "203")}
          ${at(0, 186, 566, 19, "dlab", "Days to go")}
          ${at(98, 217, 370, 43, "rom", "<b>ROM</b><em>Saturday, 20 March 2027</em><span>119 days to go</span>")}
          ${at(566, 79, 1, 150, "vline", "")}
          ${at(615, 0, 469, 308, "quote", "<blockquote>“The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves.”</blockquote><figcaption>— Victor Hugo</figcaption>")}`);
  }

  // A frame (browser or phone) whose content area holds `inner`.
  function shell(V, url, inner, extraCls = "") {
    const [fx, fy, fw, fh] = V.rect;
    const el = document.createElement("div");
    let cx, cy;
    if (V.kind === "browser") {
      el.className = "browser " + extraCls;
      el.innerHTML = window.chromeBar({ active: "aislelys", url }); // a Chrome window (shared/chrome.js)
      [cx, cy] = [0, V.bar];
    } else {
      el.className = "phone " + extraCls;
      el.innerHTML = `<div class="scr"><div class="sb"><span>9:41</span><i><b style="height:5px"></b><b style="height:7px"></b><b style="height:9px"></b><b style="height:11px"></b></i></div></div><div class="island"></div><div class="homebar"></div>`;
      [cx, cy] = [0, 47];
    }
    Object.assign(el.style, { left: fx + "px", top: fy + "px", width: fw + "px", height: fh + "px" });
    const content = document.createElement("div");
    content.className = "content" + (V.kind === "phone" ? " m" : "");
    Object.assign(content.style, { left: cx + "px", top: cy + "px", width: V.cw + "px", height: V.ch + "px" });
    content.innerHTML = inner;
    (V.kind === "browser" ? el : el.querySelector(".scr")).append(content);
    el.content = content;
    return el;
  }

  // ---- the two layouts --------------------------------------------------
  const SIDE = .55;  // carousel: opacity of the frames peeking at the sides
  const VIEWS = {
    desk: {
      // a 1390 × 860 browser, shown larger on screen (owner's request)
      W: 1472, H: 1024, scale: .8, kind: "browser", bar: 84, // 84: the Chrome bar
      rect: [40, 40, 1392, 944], cw: 1390, ch: 860, ox: 41 + DX, oy: 125,
      // [scroll point, x, y, scale, opacity]
      // Desktop: a looping carousel (no keys). Every browser stays full size,
      // carousel.gap apart; after the overview build the other two slide in to peek at
      // both sides (Landing left, Budget right, dimmed to SIDE). Each step the
      // row slides left and the one leaving on the left comes round on the right.
      // gap: one browser width (1392) + 48 between them
      carousel: { appear: [.34, .38], steps: [[.40, .47], [.71, .78]], gap: 1440 },
      count: [.48, .55], open: [.55, .69], // budget numbers count up, then the cards open
      ovScroll: null,
      parts: [
        { kind: "fly", a: .36, x: 34, y: 478, w: 554, h: 201, cls: "glass panel", from: [-900, 160, -10], html: panel("Newly added", "Planner", NEWLY) },
        { kind: "fly", a: .44, x: 612, y: 478, w: 554, h: 201, cls: "glass panel", from: [900, 200, 10], html: panel("Coming up", "Planner", COMING) },
        { kind: "pop", a: .52, x: 34, y: 703, w: 1132, h: 154, cls: "glass panel", html: `<div class="ph"><h2>Budget</h2><a>Budget →</a></div>` },
        ...CELLS.map((c, i) => ({ kind: "fly", a: .58 + i * .05, x: 53 + i * 276.3, y: 759, w: 265, h: 79, cls: "glass cell" + (i === 3 ? " hi" : ""), from: [[-760, 260, -12], [-200, 560, 8], [220, 600, -8], [760, 240, 12]][i], html: cell(...c) })),
      ],
      // captured at 1390 × 860; rows measured with the capture's own settings (reduced motion, 1390 × 860)
      home: { src: BASE + "img/desk-home.jpg", url: "aislelys.com", h: 2700, to: 905, guests: 1763, // guests: the Guest list section centred
        link: [831.3, 2196, 330.3, 46], // the invite-link box: the dev build shows its local address there
        rows: { x: 756.5, y: [1246, 1274.1, 1302.2], w: 475, h: 22, font: "400 14.72px/22.08px var(--ui)", av: 453.2 },
        cover: [754, 1242, 481, 85], pill: [1086.1, 1149.7, 91, 17] },
    },
    mob: {
      // the owner's phone image, with its own status bar; the 390 × 797 page area
      // starts below it, at (65.47, 134.86)
      W: 562, H: 1015.8, scale: 1.01, kind: "phone",
      rect: [20, 20, 522, 975.8], cw: 390, ch: 797, ox: 85.47, oy: 154.86,
      // Phone: the same looping carousel as desktop (owner's request). Side
      // phones are 15% smaller (small) and grow as they reach the centre; gap is
      // centre to centre: 215.3 (half the phone body) + 26 space + 183 (half a small phone).
      carousel: { appear: [.34, .38], steps: [[.40, .47], [.71, .78]], gap: 424, small: .85 },
      count: [.48, .55], open: [.55, .69],
      // the phone's overview is taller than its screen: the page scrolls as
      // the pieces arrive (keys are [build progress S, px scrolled])
      ovScroll: [[0, 0], [.40, 0], [.47, 286], [.55, 286], [.62, 546]], // +76: taller banner (Victor Hugo quote)
      parts: [
        { kind: "fly", a: .30, x: 20, y: 630, w: 350, h: 201, cls: "glass panel", from: [-480, 140, -12], html: panel("Newly added", "Planner", NEWLY) },
        { kind: "fly", a: .46, x: 20, y: 855, w: 350, h: 201, cls: "glass panel", from: [480, 180, 12], html: panel("Coming up", "Planner", COMING) },
        { kind: "pop", a: .60, x: 20, y: 1079, w: 350, h: 245, cls: "glass panel", html: `<div class="ph"><h2>Budget</h2><a>Budget →</a></div>` },
        ...CELLS.map((c, i) => ({ kind: "fly", a: .64 + i * .045, x: [39, 201][i % 2], y: [1136, 1227][i >> 1], w: 150, h: 79, cls: "glass cell" + (i === 3 ? " hi" : ""), from: [[-420, 200, -12], [420, 260, 12], [-420, 420, -10], [420, 460, 10]][i], html: cell(...c) })),
      ],
      home: { src: BASE + "img/mob-home.jpg", url: "", h: 4150, to: 2070, guests: 3288, link: [58, 4039.9, 164.7, 46],
        rows: { x: 74.3, y: [2398.4, 2426.4, 2454.4], w: 244, h: 22, font: "400 13.6px/20.4px var(--ui)", av: 222.4 },
        cover: [72, 2395, 250, 84], pill: [173.2, 2302.6, 91, 17] },
    },
  };

  const stage = document.getElementById("ais-stage"), scaler = document.getElementById("ais-scaler");
  const track = document.getElementById("ais-track"), hero = document.getElementById("ais-hero"), hint = document.getElementById("ais-hint");
  // Pacing (owner's request): the overview builds in 2 scrolls; 1 to slide to the
  // budget; 1 to count up and open the Venue costs until Photography shows; 1 to
  // slide to the landing page, already at the tasks; 1 that sets off the
  // strike-off (it then plays by itself); 1 down to the Guest list.
  // The opening headline holds for the first half scroll (owner's request: pause on the hero).
  // Ends on the struck-off tasks (owner's request: the last step — the scroll on to
  // the Guest list — is cut so the next project comes sooner).
  const PACE = [[0, 0], [.5, 0], [2.5, .34], [3.5, .475], [4.5, .70], [5.5, .785], [6, .80], [7, .865], [7.5, .92]]; // landing: slides in on its hero, holds ½ scroll (owner's request), 1 down to the tasks, ½ sets off the strike-off
  window.pace(track, PACE);
  // "Visit live site" under the window (shared/live.js)
  const live = window.liveLink(document.getElementById("ais-hint").parentElement, { href: "https://aislelys.com", icon: "shared/favicons/aislelys.png", name: "Aislelys" });

  function makeWin() {
    const [fx, fy, fw, fh] = V.rect;
    const win = document.createElement("div");
    win.className = "win";
    Object.assign(win.style, { width: V.W + "px", height: V.H + "px", transformOrigin: `${fx + fw / 2}px ${fy + fh / 2}px` });
    return win;
  }

  // Window 2: the Budget page, live, so its numbers can count and its cards open.
  function budgetPage(m) {
    const cards = CATS.map(([name, c, items]) => {
      const sub = items.reduce((s, it) => s + it[1], 0);
      return `<div class="glass bsec" style="--c:${c}"><div class="bsh"><span class="sd"></span><b>${name}</b><span class="sst">$ ${money(sub)} spent</span><span class="scnt">${items.length}</span></div>
        <div class="cl">${items.map(([t, cost, paid, notes]) => `<div class="bc" style="--c:${c}"><div class="bch"><span class="chev">${CHEV}</span><span class="ct">${t}</span><span class="pp${paid ? " paid" : ""}">${paid ? "Paid" : "Unpaid"}</span></div>
          <div class="bcb"><div class="bcbi"><div class="vb"><span class="vl">Cost</span><p>S$ ${money(cost)}</p></div><div class="vb"><span class="vl">Notes</span><p>${notes || "<em>No notes yet.</em>"}</p></div><div class="cf"><span>Edit</span></div></div></div></div>`).join("")}</div></div>`;
    }).join("");
    return `<div class="bscroll"><div class="bhead" style="height:${m ? 185 : 118}px">${header(m, "Budget")}</div>
      <div class="bmain"><h2 class="pt">Budget</h2>
        <p class="ps">Set your overall budget and log expenses in any currency — everything totals in SGD automatically. Change your home currency in Settings.</p>
        <div class="bsum">
          <div class="glass cell"><span class="bl">Total budget (SGD)</span><span class="row"><span class="bv">S$ <span data-n="total">0</span></span></span></div>
          <div class="glass cell"><span class="bl">Total savings</span><span class="row"><span class="bv">S$ <span data-n="savings">0</span></span><span class="pct" data-n="pct">(0%)</span></span></div>
          <div class="glass cell"><span class="bl">Remaining (SGD)</span><span class="bv pos">$ <span data-n="left">0.00</span></span></div>
          <div class="glass cell hi"><span class="bl">Total (SGD)</span><span class="bv">$ <span data-n="spent">0.00</span></span></div>
        </div>
        <span class="addx">+ Add expense</span>
        <div class="secs">${cards}</div>
      </div></div>`;
  }

  // Window 3: the landing page capture, with the three sub-task rows redrawn
  // on top so they can be struck off one by one.
  function landing() {
    const H = V.home, [fx, fy, fw, fh] = V.rect;
    const el = shell(V, H.url, "");
    const view = el.content;
    view.className = "view";
    const r = H.rows;
    view.innerHTML = `<div class="vscroll"><img src="${H.src}" alt="Aislelys landing page" decoding="async">
      <div class="cover" style="left:${H.cover[0]}px;top:${H.cover[1]}px;width:${H.cover[2]}px;height:${H.cover[3]}px"></div>
      <div class="linkc" style="left:${H.link[0]}px;top:${H.link[1]}px;width:${H.link[2]}px;height:${H.link[3]}px">aislelys.com/guests/…</div>
      <div class="pillc" style="left:${H.pill[0]}px;top:${H.pill[1]}px;width:${H.pill[2]}px;height:${H.pill[3]}px">0/3 sub-tasks</div>
      ${SUBTASKS.map(([t, who, c], i) => `<div class="srow" style="left:${r.x}px;top:${r.y[i]}px;width:${r.w}px;height:${r.h}px;font:${r.font}"><span class="st">${RING}${CHECK}</span><span class="nm">${t}</span><span class="av" style="background:${c}">${who}</span></div>`).join("")}
    </div>`;
    el.scroller = view.querySelector(".vscroll");
    el.pill = view.querySelector(".pillc");
    el.rows = [...view.querySelectorAll(".srow")].map((row) => ({ row, nm: row.querySelector(".nm"), ring: row.querySelector(".ring"), ck: row.querySelector(".ck") }));
    return el;
  }

  let V = null, wins = {}, ov, nav, head, pgw, els = [], bud, home, cards = [], nums = {}, bsc = 0, bezel = null;
  function build(name) {
    if (V === VIEWS[name]) return;
    V = VIEWS[name];
    const m = V.kind === "phone";
    stage.replaceChildren();
    stage.style.width = V.W + "px"; stage.style.height = V.H + "px";
    wins = {};

    wins.home = makeWin(); home = landing(); wins.home.append(home);
    wins.bud = makeWin(); bud = shell(V, "aislelys.com/mira-theo/budget", budgetPage(m)); wins.bud.append(bud);
    cards = [...bud.querySelectorAll(".bc")].map((c) => ({ c, body: c.querySelector(".bcb"), inner: c.querySelector(".bcbi"), chev: c.querySelector(".chev") }));
    nums = Object.fromEntries([...bud.querySelectorAll("[data-n]")].map((e) => [e.dataset.n, e]));
    bsc = 0;

    wins.ov = makeWin();
    ov = shell(V, "aislelys.com/mira-theo", `<div class="pgw"><div class="group" data-nav>${header(m, "")}</div><div class="group" data-head>${overviewHero(m)}</div></div>`);
    pgw = ov.querySelector(".pgw");
    nav = ov.querySelector("[data-nav]");
    head = ov.querySelector("[data-head]");
    wins.ov.append(ov);
    els = V.parts.map((p) => {
      const el = document.createElement("div");
      el.className = "pc " + p.cls;
      el.innerHTML = p.html;
      Object.assign(el.style, { left: V.ox + p.x + "px", top: V.oy + p.y + "px", width: p.w + "px", height: p.h + "px", opacity: 0 });
      wins.ov.append(el);
      return el;
    });
    bezel = window.addBezel(wins.ov, V); // the phone stays in front of the flying pieces
    stage.append(wins.home, wins.bud, wins.ov);
  }

  // a phone-shaped screen gets the phone; anything wider gets the browser
  function fit() {
    build(innerWidth < 700 || innerWidth / innerHeight < .75 ? "mob" : "desk");
    const s = Math.min(innerWidth / V.W, innerHeight / V.H) * V.scale;
    scaler.style.transform = `scale(${s}) translate(${-V.W / 2}px, ${-V.H / 2}px)`;
    window.placeLive(live, V, s);
    // "What you just watched" sits close to the last window: the gap under
    // the frame plus the section's top padding is cut by 45% (desktop) / 25% (phone)
    const after = document.getElementById("ais-after");
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
  // piecewise-eased value between [point, value] keys
  const along = (keys, t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, b] = [keys[i], keys[i + 1]];
      if (t < b[0]) return a[1] + (b[1] - a[1]) * easeIO((t - a[0]) / (b[0] - a[0]));
    }
    return keys[keys.length - 1][1];
  };

  const ZOOM = .45; // a flying part starts 45% larger than its real size
  let target = 0, cur = 0, raf = 0, strikeAt = null;
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
    const T = cur;               // the whole track
    const S = clamp(T / .34);    // the overview build uses the first 34% of it

    // windows hand over: overview → budget → landing page
    if (V.carousel) {
      // ring position: 0 = centre, ±1 = peeking at a side, ±1.5 = out of sight
      const C = V.carousel;
      const p = C.steps.reduce((s, [a, b]) => s + easeIO(prog(T, a, b)), 0);
      const appear = easeOut(prog(T, ...C.appear));
      ["ov", "bud", "home"].forEach((id, i) => {
        const w = wins[id];
        const pos = ((((i - p + 1.5) % 3) + 3) % 3) - 1.5;
        const d = Math.abs(pos);
        // the overview is on stage from the start; the other two arrive after its build
        const shown = id === "ov" && p < .5 ? 1 : appear;
        let op = (d <= 1 ? 1 - (1 - SIDE) * d : SIDE * (1 - prog(d, 1, 1.5))) * shown;
        const x = pos * C.gap + Math.sign(pos) * C.gap * .3 * (1 - shown);
        w.style.transform = `translate(${x}px, 0px) scale(${1 - (1 - (C.small ?? 1)) * Math.min(d, 1)})`;
        w.style.opacity = op;
        w.style.visibility = op < .005 ? "hidden" : "visible";
      });
    } else for (const id of ["ov", "bud", "home"]) {
      const k = V.keys[id], w = wins[id];
      let f = k[0];
      if (T >= k[k.length - 1][0]) f = k[k.length - 1];
      else for (let i = 0; i < k.length - 1; i++) {
        const [a, b] = [k[i], k[i + 1]];
        if (T >= a[0] && T < b[0]) { const e = easeIO((T - a[0]) / (b[0] - a[0])); f = a.map((v, j) => v + (b[j] - v) * e); break; }
      }
      w.style.transform = `translate(${f[1]}px, ${f[2]}px) scale(${f[3]})`;
      w.style.opacity = f[4];
      w.style.visibility = f[4] < .005 ? "hidden" : "visible";
    }

    // ---- 1. overview build
    const h = easeOut(prog(S, .01, .12));
    hero.style.opacity = 1 - h;
    hero.style.transform = `translateY(${-h * 60}px)`;
    hint.style.opacity = 1 - prog(S, 0, .04);
    const b = easeOutQuint(prog(S, .05, .2));
    
    live.style.opacity = b;
    if (live.mark && !live.mark.classList.contains("in-hero")) live.mark.style.opacity = live.style.opacity; // the wordmark above the window (desktop)
    ov.style.opacity = b;
    ov.style.transform = `translateY(${(1 - b) * 90}px) scale(${.96 + .04 * b})`;
    // pieces fly over the phone; once the last one has landed, the frame copy fades
    // in on top so the phone sits in front (owner's request: unnoticed)
    if (bezel) {
      const landed = S >= Math.max(...V.parts.map((q) => q.a + (q.kind === "fly" ? .17 : .06)));
      bezel.style.opacity = landed ? ov.style.opacity : 0;
      bezel.style.transform = ov.style.transform;
    }
    nav.style.opacity = easeOut(prog(S, .17, .29));
    const hd = easeOut(prog(S, .21, .33));
    head.style.opacity = hd;
    head.style.transform = `translateY(${(1 - hd) * 10}px)`;
    const sc = V.ovScroll ? along(V.ovScroll, S) : 0;
    pgw.style.transform = `translateY(${-sc}px)`;
    V.parts.forEach((p, i) => {
      const el = els[i];
      if (p.kind === "fly") {
        const k = prog(S, p.a, p.a + .17);
        const f = 1 - easeOutQuint(k);
        el.style.opacity = k <= 0 ? 0 : Math.min(1, k * 5);
        el.style.transform = `translate(${p.from[0] * f}px, ${p.from[1] * f - sc}px) rotate(${p.from[2] * f}deg) scale(${1 + ZOOM * f})`;
        el.style.boxShadow = f > .01 ? `0 ${(40 * f).toFixed(0)}px ${(60 * f).toFixed(0)}px -18px rgba(60,45,35,${(.26 * f).toFixed(3)})` : "";
      } else {
        const k = prog(S, p.a, p.a + .06);
        el.style.opacity = Math.min(1, k * 2.2);
        el.style.transform = `translateY(${(1 - easeOut(k)) * 14 - sc}px) scale(${.86 + .14 * back(k)})`;
      }
    });

    // ---- 2. budget: the numbers count up, then every expense opens
    const c = easeOut(prog(T, ...V.count));
    const OPEN = V.open;
    const total = BUDGET.total * c, savings = BUDGET.savings * c, spent = BUDGET.spent * c;
    nums.total.textContent = Math.round(total);
    nums.savings.textContent = Math.round(savings);
    nums.pct.textContent = `(${total ? Math.round((savings / total) * 100) : 0}%)`;
    nums.spent.textContent = money(spent);
    nums.left.textContent = money(total - spent);
    // only the Venue costs open; the page then scrolls just until Photography shows
    const openN = CATS[0][2].length;
    const step = (OPEN[1] - OPEN[0]) / (openN + .4);
    let last = -1;
    cards.forEach((cd, i) => {
      const k = i < openN ? easeIO(prog(T, OPEN[0] + i * step, OPEN[0] + i * step + step * 1.4)) : 0;
      cd.body.style.height = (k * cd.inner.offsetHeight).toFixed(1) + "px";
      cd.chev.style.transform = `rotate(${90 * k}deg)`;
      if (k > 0) last = i;
    });
    // keep the card that is opening in view: the page scrolls with it
    const scroller = bud.content.firstElementChild;
    let want = 0;
    if (last >= 0) {
      const cd = cards[last].c;
      let top = 0;
      for (let n = cd; n && n !== scroller; n = n.offsetParent) top += n.offsetTop;
      want = top + cd.offsetHeight + 28 - V.ch;
      // once the Venue costs are open, bring the Photography heading into view
      const photo = bud.querySelectorAll(".bsec")[1];
      if (photo && last === openN - 1 && prog(T, OPEN[0] + last * step, OPEN[0] + last * step + step * 1.4) >= 1) {
        let pt = 0;
        for (let n = photo; n && n !== scroller; n = n.offsetParent) pt += n.offsetTop;
        want = Math.max(want, pt + 64 - V.ch);
      }
      want = clamp(want, 0, Math.max(0, scroller.offsetHeight - V.ch));
    }
    bsc += (want - bsc) * (still.matches ? 1 : .22);
    if (Math.abs(want - bsc) < .3) bsc = want;
    scroller.style.transform = `translateY(${-bsc}px)`;

    // ---- 3. landing page: scroll down to the task card, then strike off its sub-tasks
    const H = V.home;
    // down to the task card, strike off its sub-tasks, then on to the middle
    // of the Guest list section, where the story ends
    // it goes straight to the tasks while it slides in (owner's request)
    home.scroller.style.transform = `translateY(${-along([[.71, 0], [.80, 0], [.86, H.to], [.925, H.to], [.99, H.guests]], T)}px)`; // pauses on the hero (owner's request)
    // the next scroll sets off the strike-off, which then plays by itself
    if (T >= .875) { if (strikeAt === null) strikeAt = performance.now(); } else strikeAt = null;
    const secs = strikeAt === null ? 0 : still.matches ? 99 : (performance.now() - strikeAt) / 1000;
    const striking = strikeAt !== null && secs < 2.2;
    let done = 0;
    home.rows.forEach((r, i) => {
      const k = prog(secs, .15 + i * .55, .65 + i * .55);
      r.nm.style.backgroundSize = `${(easeOut(k) * 100).toFixed(1)}% 1px`;
      r.nm.style.color = k > .6 ? "#917F6A" : "";
      r.ring.style.opacity = k > .15 ? 0 : 1;
      r.ck.style.opacity = k > .15 ? 1 : 0;
      r.ck.style.transform = `scale(${k > .15 ? .7 + .3 * back(prog(k, .15, .55)) : .7})`;
      if (k >= 1) done++;
    });
    home.pill.textContent = `${done}/3 sub-tasks`;

    if (cur !== target || bsc !== want || striking) raf = requestAnimationFrame(draw);
  }

  addEventListener("scroll", readScroll, { passive: true });
  // the project indicator jumps straight here: settle at once, no replay in between
  addEventListener("pf:jump", () => { readScroll(); cur = target; draw(); });
  addEventListener("resize", () => { fit(); cur = target; readScroll(); draw(); });
  fit(); readScroll(); cur = target; draw();
  // card heights depend on the web fonts: redraw once they are in
  document.fonts?.ready.then(() => draw());
})();
