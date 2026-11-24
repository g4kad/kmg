// Kedaipal story: scroll engine + content. Runs inside #kedaipal.
(() => {
  const LOGO = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDMwLjMuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDkuMDMgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMCIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA3Ny41IDY4LjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDc3LjUgNjguMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiMwRjE3MkE7fQoJLnN0MXtmaWxsOiMxMEI5ODE7fQoJLnN0MntmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8Zz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik03NC4xLDEwLjlDNzQsNS4zLDY5LjQsMC43LDYzLjgsMC43bC01MC4xLDBDOCwwLjcsMy40LDUuMywzLjMsMTAuOUwwLjksNDUuMWwwLDAuNGMwLDcuNyw2LjIsMTMuOSwxMy45LDEzLjkKCQlsMTUsMGwzLjksNS40YzEuMiwxLjYsMy4xLDIuNiw1LjEsMi42YzIsMCwzLjktMSw1LjEtMi42bDMuOS01LjRsMTUsMGM3LjcsMCwxMy45LTYuMiwxMy45LTEzLjl2LTAuMkw3NC4xLDEwLjl6Ii8+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNNjkuMiwxMS4xYzAtMy0yLjQtNS40LTUuNC01LjRsLTUwLjEsMGMtMywwLTUuNCwyLjQtNS40LDUuNEw1LjgsNDUuNGMwLDQuOSw0LDguOSw4LjksOC45bDE2LDAKCQkJYzEsMCwxLjksMC41LDIuNSwxLjNsNC40LDYuMmMwLjUsMC43LDEuNiwwLjcsMi4xLDBsNC40LTYuMmMwLjYtMC44LDEuNS0xLjMsMi41LTEuM2wxNiwwYzQuOSwwLDguOS00LDguOS04LjlMNjkuMiwxMS4xeiIvPgoJPC9nPgoJPHBhdGggY2xhc3M9InN0MiIgZD0iTTUyLjMsMTYuNmMtMS45LDAtMy40LDEuNS0zLjQsMy40YzAsMS4zLDAuNywyLjQsMS43LDNsMCw3LjJjMCwzLjYtMi45LDYuNS02LjUsNi41bC0xMS40LDAKCQljLTMuNiwwLTYuNS0yLjktNi41LTYuNWwwLTcuM2MxLTAuNiwxLjctMS43LDEuNy0yLjljMC0xLjktMS41LTMuNC0zLjQtMy40Yy0xLjksMC0zLjQsMS41LTMuNCwzLjRjMCwxLjMsMC44LDIuNSwxLjksM2wwLDcuMgoJCWMwLDUuNCw0LjQsOS44LDkuOCw5LjhsMTEuNCwwYzUuNCwwLDkuOC00LjQsOS44LTkuOGwwLTcuMmMxLjEtMC42LDEuOC0xLjcsMS44LTNDNTUuNywxOC4xLDU0LjIsMTYuNiw1Mi4zLDE2LjZ6Ii8+CjwvZz4KPC9zdmc+Cg==";
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    pkg: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21h.01M17 21h4v-3"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-5 4 3 5-6"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    calcheck: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18m-12 6 2 2 4-4"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  };
  const I = (k) => `<svg class="i" viewBox="0 0 24 24">${P[k]}</svg>`;

  // ---- shared content ----------------------------------------------------
  const ORDERS = [
    { who: "Hafiz Osman", amt: "RM 150.00", id: "#ORD-EULJ", when: "30 Sept, 5:13 pm", ago: "51d ago", item: "Into The Falls 2026 Registration", qty: 1, price: "RM 150.00", st: ["conf", "Confirmed"], chip: ["", "4 Dec 2026 · 2:00 PM"], icon: "pkg" },
    { who: "Nur Aina", amt: "RM 35.20", id: "#ORD-22YU", when: "24 Jul, 1:47 pm", ago: "119d ago", item: "Cempedak", opt: "8kg", qty: 1, price: "RM 31.20", st: ["conf", "Confirmed"], chip: ["late", "Overdue · 24 Jul 2026"], icon: "truck" },
    { who: "Walk-in customer", amt: "RM 15.60", id: "#ORD-FW7H", when: "15 Oct, 7:32 pm", ago: "36d ago", item: "Cempedak", opt: "4kg", qty: 1, price: "RM 15.60", st: ["new", "New"], icon: "pkg" },
    { who: "Nur Aina", amt: "RM 35.20", id: "#ORD-ALT2", when: "24 Jul, 2:12 pm", ago: "119d ago", item: "Cempedak", opt: "8kg", qty: 1, price: "RM 31.20", st: ["done", "Delivered"], chip: ["", "24 Jul 2026"], icon: "truck" },
    { who: "Hafiz Osman", amt: "RM 15.70", id: "#ORD-97TJ", when: "24 Jul, 1:03 pm", ago: "119d ago", item: "Cempedak", opt: "4kg", qty: 1, price: "RM 15.70", st: ["done", "Completed"], icon: "pkg" },
    { who: "Walk-in customer", amt: "RM 0.00", id: "#ORD-DGRP", when: "15 Oct, 7:42 pm", ago: "36d ago", item: "Cempedak", opt: "3kg", qty: 1, price: "RM 0.00", st: ["done", "Completed"], icon: "pkg" },
  ];
  const card = (o) => `
    <div class="t"><b>${o.who}</b><span class="amt">${o.amt}</span></div>
    <div class="m">${o.id} · ${o.when} (${o.ago})</div>
    <div class="it"><span>${o.qty}× <b>${o.item}</b>${o.opt ? " · " + o.opt : ""}</span><span>${o.price}</span></div>
    <div class="f"><span class="pl ${o.st[0]}">${o.st[1]}</span>${o.chip ? `<span class="dc ${o.chip[0]}">${I("cal")}${o.chip[1]}</span>` : ""}<span class="end">${I(o.icon)}${I("chev")}</span></div>`;
  const toast = `<span class="ok">${I("check")}</span><span><b>Payment received</b><small>#ORD-EULJ · RM 150.00 from Hafiz Osman</small></span>`;
  const TILES = [
    { ib: "amber", ic: "bell", num: "3", amber: true, t: "New orders", s: "to confirm" },
    { ib: "mint", ic: "calcheck", num: "5", t: "Due today", s: "to prepare" },
    { ib: "slate", ic: "cash", num: "RM 150", t: "To collect", s: "2 unpaid" },
  ];
  const wideTile = (x) => `<span class="ib ${x.ib}">${I(x.ic)}</span><span><b>${x.t}</b><small>${x.s}</small></span><span class="num${x.amber ? " amber" : ""}">${x.num}</span>`;
  const tallTile = (x) => `<span class="ib ${x.ib}">${I(x.ic)}</span><span class="num${x.amber ? " amber" : ""}">${x.num}</span><b>${x.t}</b><small>${x.s}</small>`;
  const NAV = [["home", "Home"], ["pkg", "Products"], ["tag", "Promotions"], ["bag", "Orders"], ["truck", "Deliveries"], ["qr", "Counter"], ["users", "Customers"], ["ticket", "Vouchers"], ["chart", "Insights"], ["gift", "Refer & earn"], ["gear", "Settings"]];
  const pips = Array.from({ length: 18 }, (_, i) => `<i${i < 11 ? "" : ' class="o"'}></i>`).join("");
  const at = (x, y, w, h, cls, html) => `<div class="at ${cls}" style="left:${x}px;top:${y}px;${w ? `width:${w}px;` : ""}${h ? `height:${h}px;` : ""}">${html}</div>`;

  // Two views of one story. Each frame arrives whole, its nav and header fade
  // in place, the button + tiles fly in, and the order cards pop in one by one.
  // Part coordinates are relative to the frame's content area (ox, oy).
  // Desktop browsers are the same size on screen in every project (owner's request).
  // Kedaipal's page is laid out 1200 wide, the others 1390: its stage is the
  // others' (1472 × 1024 at scale .8) shrunk by K = 1200 / 1392, so its window
  // shows exactly as wide, and its Chrome bar is drawn 1392 wide then shrunk by K
  // so the bar matches too.
  const K = 1200 / 1392, BAR = 84 * K;
  // the page area is trimmed to the others' proportions (1390 × 860), so the
  // window is the same height on screen too: 944 × K - BAR = 741.4 (was 780)
  const CH = 944 * K - BAR, FH = CH + BAR; // page-area height, frame height
  const kBar = (opts) => `<div style="position:absolute;left:0;top:0;width:1392px;height:84px;transform:scale(${K});transform-origin:0 0">${window.chromeBar(opts)}</div>`;
  const VIEWS = {
    desk: {
      // the browser is a Chrome window (shared/chrome.js): its 84 px bar sits
      // above the same 1200 × 780 page area as before
      W: 1472 * K, H: 1024 * K, scale: .8,
      ox: (1472 * K - 1200) / 2 + 1, oy: (1024 * K - FH) / 2 + 1 + BAR,
      rect: [(1472 * K - 1200) / 2, (1024 * K - FH) / 2, 1200, FH], kind: "browser", bar: BAR,
      pages: { blog: ["img/desk-blog.jpg", "blog.kedaipal.com", 1710], home: ["img/desk-home-dark.jpg?v=2", "kedaipal.com", 1340, true] }, // scroll ends with the product demo in view
      // [scroll point, x, y, scale, opacity] — between points the window eases
      keys: {
        dash: [[.40, 0, 0, 1, 1], [.48, 0, 0, .46, 1], [.56, 0, 0, .46, 1], [.64, 820, 0, .36, 0]],
        blog: [[.40, -560, 60, .40, 0], [.48, -560, 0, .40, 1], [.56, -560, 0, .40, 1], [.64, 0, 0, 1, 1], [.74, 0, 0, 1, 1], [.82, -820, 0, .36, 0]],
        home: [[.40, 560, 60, .40, 0], [.48, 560, 0, .40, 1], [.56, 560, 0, .40, 1], [.62, 860, 0, .36, 0], [.72, 600, 0, .40, 0], [.82, 0, 0, 1, 1]],
      },
      frame() {
        const el = document.createElement("div");
        el.className = "browser";
        const [fx, fy, fw, fh] = VIEWS.desk.rect;
        Object.assign(el.style, { left: fx + "px", top: fy + "px", width: fw + "px", height: fh + "px" });
        el.innerHTML = `${kBar({ active: "kedaipal", url: "kedaipal.com/app" })}
          <div class="content" style="left:0;top:${BAR}px;width:1200px;height:${CH}px">
            <div class="group" data-nav><div class="side">
              <div class="brand"><img src="${LOGO}" alt=""><span><b>Kedai Aisyah</b><code>/arif-outdoor</code></span></div>
              <div class="plan"><span class="tag">PRO</span><b>312 orders left</b><span class="pips">${pips}</span></div>
              <div class="navlist">${NAV.map(([k, l], i) => `<div class="nv${i === 0 ? " on" : ""}">${I(k)}${l}</div>`).join("")}</div>
              <div class="me"><div class="u"><span class="av">AR</span><span><b>Aisyah Rahman</b><small>aisyah@example.com</small></span>${I("moon")}</div>
                <div class="wn">${I("spark")}What's new<span>2026.11.6</span></div></div>
            </div></div>
            <div class="group" data-head>
              ${at(256, 28, 54, 54, "spot", "")}
              ${at(324, 30, 0, 0, "date", "Saturday, 21 November")}
              ${at(324, 50, 0, 0, "hello", "Good morning, <em>Kedai Aisyah</em>")}
              ${at(742, 36, 202, 40, "bt refer", `${I("gift")}Refer &amp; earn <small>· they get 60</small>`)}
              ${at(256, 200, 904, 26, "sec", `<b>Latest orders</b><a>View all orders${I("chev")}</a>`)}
            </div>
          </div>`;
        return el;
      },
      parts: [
        { kind: "fly", a: .29, x: 1062, y: 36, w: 108, h: 40, cls: "bt mint", from: [520, -420, 16], html: `${I("plus")}New order` },
        { kind: "fly", a: .32, x: 952, y: 36, w: 102, h: 40, cls: "bt", from: [-140, -520, -12], html: `${I("ext")}Open store` },
        ...TILES.map((t, i) => ({ kind: "fly", a: .36 + i * .05, x: 256 + i * 306, y: 104, w: 294, h: 72, cls: "tile wide", from: [[-920, 160, -14], [-60, 720, 10], [920, 140, 14]][i], html: wideTile(t) })),
        // the newest Hafiz Osman and Walk-in customer orders fly in; the rest pop
        ...ORDERS.map((o, i) => {
          const base = { x: 256 + (i % 2) * 458, y: 240 + Math.floor(i / 2) * 160, w: 446, h: 148, cls: "oc", html: card(o) };
          if (i === 0) return { ...base, kind: "fly", a: .53, from: [-1020, -80, -10] };
          if (i === 5) return { ...base, kind: "fly", a: .70, from: [940, 460, 12] };
          return { ...base, kind: "pop", a: [0, .62, .66, .70, .74][i] };
        }),
      ],
    },
    mob: {
      // the owner's phone image (522 × 975.8 here), with its own status bar; the
      // app's page area (390 × 797) starts below it, at (65.47, 134.86)
      W: 562, H: 1015.8, ox: 85.47, oy: 107.86, scale: 1.01,
      rect: [20, 20, 522, 975.8], kind: "phone",
      pages: { blog: ["img/mob-blog.jpg", "", 1957], home: ["img/mob-home-dark.jpg?v=2", "", 1200, true] },
      // No three-up on the phone. Instead a looping carousel (owner's request):
      // after the dashboard build the landing page peeks in on the left and the
      // blog on the right (dimmed); each step slides the row left and the phone
      // leaving on the left comes round on the right. Side phones are 15% smaller
      // (small) and grow as they reach the centre; gap is centre to centre:
      // 215.3 (half the phone body) + 26 space + 183 (half a small phone).
      carousel: { appear: [.40, .45], steps: [[.50, .58], [.74, .82]], gap: 424, side: .55, small: .85 },
      frame() {
        const el = document.createElement("div");
        el.className = "phone";
        Object.assign(el.style, { left: "20px", top: "20px", width: "522px", height: "975.8px" });
        el.innerHTML = `<div class="scr">
            <div class="sb"><span>9:41</span><i><b style="height:5px"></b><b style="height:7px"></b><b style="height:9px"></b><b style="height:11px"></b></i></div>
            <div class="group" data-nav>
              <div class="mtop"><img src="${LOGO}" alt=""><span><b>Kedai Aisyah</b><code>kedaipal.com/arif-outdoor</code><span class="pr"><span>PRO</span><em>312 left</em></span></span><span class="r">${I("moon")}<span class="av">AR</span></span></div>
              <div class="mtabs">
                <div class="on"><span>${I("home")}</span>Home</div>
                <div>${I("bag")}Orders</div>
                <div>${I("qr")}Counter</div>
                <div>${I("chart")}Insights</div>
                <div>${I("grid")}More</div>
              </div>
            </div>
            <div class="group" data-head>
              ${at(20, 153, 48, 48, "spot", "")}
              ${at(80, 154, 0, 0, "date", "Saturday, 21 November")}
              ${at(80, 172, 0, 0, "hello sm", "Good morning, <em>Kedai Aisyah</em>")}
              ${at(20, 420, 350, 24, "sec", `<b>Latest orders</b><a>View all${I("chev")}</a>`)}
            </div>
          </div><div class="island"></div><div class="homebar"></div>`;
        return el;
      },
      parts: [
        { kind: "fly", a: .30, x: 20, y: 220, w: 350, h: 46, cls: "bt mint", from: [420, -320, 12], html: `${I("plus")}New order` },
        ...TILES.map((t, i) => ({ kind: "fly", a: .35 + i * .05, x: 20 + i * 119, y: 282, w: 112, h: 122, cls: "tile tall", from: [[-480, 120, -14], [-30, 580, 10], [480, 100, 14]][i], html: tallTile(t) })),
        { kind: "fly", a: .56, x: 20, y: 456, w: 350, h: 142, cls: "oc", from: [-520, 60, -10], html: card(ORDERS[0]) },
        { kind: "pop", a: .74, x: 20, y: 608, w: 350, h: 142, cls: "oc", html: card(ORDERS[1]) },
      ],
    },
  };

  const stage = document.getElementById("stage"), scaler = document.getElementById("scaler");
  const track = document.getElementById("track"), hero = document.getElementById("hero"), hint = document.getElementById("hint");
  // Pacing (owner's request): the dashboard builds in 2 scrolls, then the three-up,
  // the blog, the landing page and its scroll take one scroll each.
  // The headline holds for the first half scroll (owner's request: a brief pause on the title).
  // The landing page gets one more scroll again (owner's request): after it slides
  // in, it scrolls down to the demo's end scene ("12 DMs. 12 paid orders.").
  const PACE = [[0, 0], [0.5, 0], [2.5, .4], [3.5, .56], [4.5, .74], [5.5, .835], [6.5, 1]];
  window.pace(track, PACE);
  // "Visit live site" under the window (shared/live.js)
  const live = window.liveLink(document.getElementById("hint").parentElement, { href: "https://kedaipal.com", icon: "shared/favicons/kedaipal.svg", name: "Kedaipal" });

  const LABELS = {
    dash: ["Seller dashboard", "Orders, numbers, what's next"],
    blog: ["Blog", "Guides and seller stories"],
    home: ["Landing page", "kedaipal.com"],
  };

  // A window holder: the dashboard, or a captured page in the same frame.
  function makeWin(id) {
    const [fx, fy, fw, fh] = V.rect;
    const win = document.createElement("div");
    win.className = "win";
    Object.assign(win.style, { width: V.W + "px", height: V.H + "px", transformOrigin: `${fx + fw / 2}px ${fy + fh / 2}px` });
    const lab = document.createElement("div");
    lab.className = "lab";
    lab.style.top = fy + fh + (V.kind === "phone" ? 40 : 46) + "px";
    lab.innerHTML = `${LABELS[id][0]}<small>${LABELS[id][1]}</small>`;
    win.lab = lab;
    return win;
  }
  function pageFrame(id) {
    const [fx, fy, fw, fh] = V.rect;
    const [src, url, , dark] = V.pages[id];
    const el = document.createElement("div");
    let vx, vy, vw, vh;
    if (V.kind === "browser") {
      el.className = "browser";
      el.innerHTML = kBar({ active: "kedaipal", url, title: id === "blog" ? "Kedaipal Blog" : undefined });
      [vx, vy, vw, vh] = [0, V.bar, fw, fh - V.bar];
    } else {
      el.className = "phone";
      el.innerHTML = `<div class="scr"><div class="sb"><span>9:41</span><i><b style="height:5px"></b><b style="height:7px"></b><b style="height:9px"></b><b style="height:11px"></b></i></div></div><div class="island"></div><div class="homebar"></div>`;
      [vx, vy, vw, vh] = [0, 47, 390, 797]; // the 390 × 844 screen, under the status bar
    }
    if (dark) el.classList.add("dark");
    Object.assign(el.style, { left: fx + "px", top: fy + "px", width: fw + "px", height: fh + "px" });
    const view = document.createElement("div");
    view.className = "view";
    Object.assign(view.style, { left: vx + "px", top: vy + "px", width: vw + "px", height: vh + "px" });
    view.innerHTML = `<img src="${src}" alt="Kedaipal ${LABELS[id][0].toLowerCase()}" decoding="async">`;
    (V.kind === "browser" ? el : el.querySelector(".scr")).append(view);
    el.img = view.querySelector("img");
    el.viewH = vh;
    return el;
  }

  let V = null, frame, nav, head, els = [], wins = {}, bezel = null;
  function build(name) {
    if (V === VIEWS[name]) return;
    V = VIEWS[name];
    stage.replaceChildren();
    stage.style.width = V.W + "px"; stage.style.height = V.H + "px";
    wins = {};
    for (const id of ["blog", "home"]) {
      const w = makeWin(id);
      w.page = pageFrame(id);
      w.append(w.page, w.lab);
      stage.append(w);
      wins[id] = w;
    }
    const dash = makeWin("dash");
    frame = V.frame();
    dash.append(frame);
    nav = frame.querySelector("[data-nav]");
    head = frame.querySelector("[data-head]");
    els = V.parts.map((p) => {
      const el = document.createElement("div");
      el.className = "pc " + p.cls;
      el.innerHTML = p.html;
      Object.assign(el.style, { left: V.ox + p.x + "px", top: V.oy + p.y + "px", width: p.w + "px", height: p.h + "px", opacity: 0 });
      dash.append(el);
      return el;
    });
    bezel = window.addBezel(dash, V); // the phone stays in front of the flying pieces
    dash.append(dash.lab);
    stage.append(dash);
    wins.dash = dash;
  }

  // a phone-shaped screen gets the app; anything wider gets the browser
  function fit() {
    build(innerWidth < 700 || innerWidth / innerHeight < .75 ? "mob" : "desk");
    const s = Math.min(innerWidth / V.W, innerHeight / V.H) * V.scale;
    scaler.style.transform = `scale(${s}) translate(${-V.W / 2}px, ${-V.H / 2}px)`;
    window.placeLive(live, V, s);
    // Bring "What you just watched" closer to the last window: the gap is the
    // white space under the frame plus the section's top padding, cut by 45%
    // on desktop and 25% on the phone view.
    const after = document.getElementById("after");
    after.style.marginTop = "0px";
    const below = innerHeight / 2 - (V.rect[1] + V.rect[3] - V.H / 2) * s;
    const gap = below + parseFloat(getComputedStyle(after).paddingTop);
    after.style.marginTop = `${-Math.round(gap * (V === VIEWS.desk ? .45 : .25))}px`;
  }

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (v, a, b) => clamp((v - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
  const back = (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  const ZOOM = .45; // a flying part starts 45% larger than its real size
  let target = 0, cur = 0, raf = 0;
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
    const T = cur;                 // the whole track
    const S = clamp(T / .40);      // the dashboard build uses the first 40% of it

    // after the build: three windows side by side, then blog, then landing page
    const easeIO = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    if (V.carousel) {
      // ring position: 0 = centre, ±1 = peeking at a side, ±1.5 = out of sight
      const C = V.carousel;
      const p = C.steps.reduce((s, [a, b]) => s + easeIO(prog(T, a, b)), 0);
      const appear = easeOut(prog(T, ...C.appear));
      ["dash", "blog", "home"].forEach((id, i) => {
        const w = wins[id];
        const pos = ((((i - p + 1.5) % 3) + 3) % 3) - 1.5;
        const d = Math.abs(pos);
        const shown = id === "dash" && p < .5 ? 1 : appear; // the dashboard is on stage from the start
        const op = (d <= 1 ? 1 - (1 - C.side) * d : C.side * (1 - prog(d, 1, 1.5))) * shown;
        w.style.transform = `translate(${pos * C.gap + Math.sign(pos) * C.gap * .3 * (1 - shown)}px, 0px) scale(${1 - (1 - (C.small ?? 1)) * Math.min(d, 1)})`;
        w.style.opacity = op;
        w.style.visibility = op < .005 ? "hidden" : "visible";
        w.lab.style.opacity = 0;
      });
    } else for (const id of ["dash", "blog", "home"]) {
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
      // labels belong to the desktop three-up; the phone view has no three-up
      w.lab.style.opacity = V.kind === "browser" ? easeOut(prog(T, .46, .51)) * (1 - prog(T, .56, .60)) : 0;
    }
    // a short scroll inside each page once it holds the centre: the blog down
    // to its "Latest articles" row, the landing page down to its demo's end scene
    for (const [id, from, to] of [["blog", .645, .73], ["home", .84, .97]]) {
      const pg = wins[id].page, total = V.pages[id][2];
      pg.img.style.transform = `translateY(${-easeIO(prog(T, from, to)) * (total - pg.viewH)}px)`;
    }

    const h = easeOut(prog(S, .01, .12));
    hero.style.opacity = 1 - h;
    hero.style.transform = `translateY(${-h * 60}px)`;
    hint.style.opacity = 1 - prog(S, 0, .04);

    const b = easeOutQuint(prog(S, .05, .2));
    frame.style.opacity = b;
    // hidden while the desktop three-up shows its labels
    
    live.style.opacity = b * (V.kind === "browser" ? 1 - easeOut(prog(T, .44, .48)) * (1 - prog(T, .58, .62)) : 1);
    if (live.mark && !live.mark.classList.contains("in-hero")) live.mark.style.opacity = live.style.opacity; // the wordmark above the window (desktop)
    frame.style.transform = `translateY(${(1 - b) * 90}px) scale(${.96 + .04 * b})`;
    // pieces fly over the phone; once the last one has landed, the frame copy fades
    // in on top so the phone sits in front (owner's request: unnoticed)
    if (bezel) {
      const landed = S >= Math.max(...V.parts.map((q) => q.a + (q.kind === "fly" ? .17 : .06)));
      bezel.style.opacity = landed ? frame.style.opacity : 0;
      bezel.style.transform = frame.style.transform;
    }
    nav.style.opacity = easeOut(prog(S, .17, .29));
    const hd = easeOut(prog(S, .21, .33));
    head.style.opacity = hd;
    head.style.transform = `translateY(${(1 - hd) * 10}px)`;

    V.parts.forEach((p, i) => {
      const el = els[i];
      if (p.kind === "fly") {
        const k = prog(S, p.a, p.a + .17);
        const f = 1 - easeOutQuint(k);
        el.style.opacity = k <= 0 ? 0 : Math.min(1, k * 5);
        // zoom in: larger while off the frame, settling to actual size as it lands
        el.style.transform = `translate(${p.from[0] * f}px, ${p.from[1] * f}px) rotate(${p.from[2] * f}deg) scale(${1 + ZOOM * f})`;
        el.style.boxShadow = f > .01 ? `0 ${(40 * f).toFixed(0)}px ${(60 * f).toFixed(0)}px -18px rgba(15,23,42,${(.26 * f).toFixed(3)})` : "";
      } else {
        const k = prog(S, p.a, p.a + .06);
        el.style.opacity = Math.min(1, k * 2.2);
        el.style.transform = `translateY(${(1 - easeOut(k)) * 14}px) scale(${.86 + .14 * back(k)})`;
      }
    });
    if (cur !== target) raf = requestAnimationFrame(draw);
  }

  addEventListener("scroll", readScroll, { passive: true });
  // the project indicator jumps straight here: settle at once, no replay in between
  addEventListener("pf:jump", () => { readScroll(); cur = target; draw(); });
  addEventListener("resize", () => { fit(); cur = target; readScroll(); draw(); });
  fit(); readScroll(); cur = target; draw();
})();
