// A Google Chrome window bar shared by every project's desktop browser (styles
// in shared/chrome.css). All three projects are "open" as tabs, each with its
// own logo; the tab of the project being shown is the active one.
//
//   window.chromeBar({ active: "aislelys", url: "aislelys.com/mira-theo", title, dark })
//
// returns the bar's HTML (84 px tall). `title` overrides the active tab's title
// (e.g. the Kedaipal blog). All bars use Chrome's dark theme; `dark: false` gives the light one.
(() => {
  const TABS = [
    { id: "kedaipal", icon: "shared/favicons/kedaipal.svg", title: "Kedaipal" },
    { id: "aislelys", icon: "shared/favicons/aislelys.png", title: "Aislelys — the wedding planner for two" },
    { id: "sgcards", icon: "shared/favicons/sgcards.png", title: "SG Cards Online — Singapore's TCG Store Locator" },
    { id: "deqly", icon: "shared/favicons/deqly.png?v=2", title: "Deqly — Leave an impact, not just a contact" },
  ];
  const ic = {
    x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
    plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
    down: '<svg viewBox="0 0 16 16"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>',
    back: '<svg viewBox="0 0 16 16"><path d="M13 8H3.5M7.5 4 3.5 8l4 4"/></svg>',
    fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h9.5M8.5 4l4 4-4 4"/></svg>',
    reload: '<svg viewBox="0 0 16 16"><path d="M12.8 6.2A5 5 0 1 0 13 9.5"/><path d="M13 3v3.4H9.6"/></svg>',
    site: '<svg viewBox="0 0 16 16"><path d="M2.5 5h7M12.5 5h1M2.5 11h1M6.5 11h7"/><circle cx="11" cy="5" r="1.6"/><circle cx="5" cy="11" r="1.6"/></svg>',
    star: '<svg viewBox="0 0 16 16"><path d="m8 2.3 1.7 3.6 3.9.5-2.9 2.7.8 3.9L8 11.1 4.5 13l.8-3.9-2.9-2.7 3.9-.5z"/></svg>',
    ext: '<svg viewBox="0 0 16 16"><path d="M6 2.8a1.4 1.4 0 0 1 2.8 0V4h3.2v3.2h-1.2a1.4 1.4 0 0 0 0 2.8H12v3.2H8.8V12a1.4 1.4 0 0 0-2.8 0v1.2H2.8V10H4a1.4 1.4 0 0 0 0-2.8H2.8V4H6z"/></svg>',
    more: '<svg viewBox="0 0 16 16" style="fill:currentColor;stroke:none"><circle cx="8" cy="3.5" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="8" cy="12.5" r="1.3"/></svg>',
  };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  // every browser uses Chrome's dark theme (owner's request: "the grey and black")
  window.chromeBar = ({ active, url = "", title, dark = true } = {}) => {
    const [host, ...rest] = url.split("/");
    const path = rest.length ? "/" + rest.join("/") : "";
    const tabs = TABS.map((t) => `<div class="chrome-tab${t.id === active ? " on" : ""}"><img src="${t.icon}" alt=""><span>${esc(t.id === active && title ? title : t.title)}</span>${ic.x}</div>`).join("");
    return `<div class="chrome${dark ? " dark" : ""}" aria-hidden="true">
      <div class="chrome-strip"><div class="chrome-lights"><i></i><i></i><i></i></div><div class="chrome-tabs">${tabs}</div><div class="chrome-new">${ic.plus}</div><div class="chrome-search">${ic.down}</div></div>
      <div class="chrome-bar"><div class="chrome-btn">${ic.back}</div><div class="chrome-btn off">${ic.fwd}</div><div class="chrome-btn">${ic.reload}</div>
        <div class="chrome-omni"><span class="site">${ic.site}</span><span><b>${esc(host)}</b><em>${esc(path)}</em></span><span class="star">${ic.star}</span></div>
        <div class="chrome-btn">${ic.ext}</div><div class="chrome-avatar"><svg viewBox="0 0 16 16" style="fill:currentColor;stroke:none"><circle cx="8" cy="6" r="2.6"/><path d="M3.2 13.2a4.8 4.8 0 0 1 9.6 0z"/></svg></div><div class="chrome-btn">${ic.more}</div></div>
    </div>`;
  };
})();

// On the phone, pieces that fly or pop in live in layers above the phone; a copy
// of the phone frame laid over them keeps the phone in front of everything
// (owner's request). Call after adding those layers to a window. It returns the
// copy, so a story whose phone rises in on its own can move the copy with it.
window.addBezel = (win, V) => {
  if (V.kind !== "phone") return;
  const b = document.createElement("div");
  b.className = "bezel";
  const [x, y, w, h] = V.rect;
  Object.assign(b.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
  win.append(b);
  return b;
};
