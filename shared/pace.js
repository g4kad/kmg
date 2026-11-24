// Scroll pacing shared by every story (owner's request: less scrolling). A story
// lists how many scrolls (one scroll = one screen height) each part takes, as
// [scrolls, T] pairs: T is the story's own timeline (0 → 1) that its animations
// are written against. Between pairs T moves evenly.
//
//   window.pace(track, PACE)        sets the track's height to fit the scrolls
//   window.paceT(scrolled, PACE)    scrolls done so far → T
(() => {
  window.pace = (track, keys) => {
    track.style.height = (keys[keys.length - 1][0] + 1) * 100 + "vh";
  };
  window.paceT = (s, keys) => {
    if (s <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, b] = [keys[i], keys[i + 1]];
      if (s < b[0]) return a[1] + (b[1] - a[1]) * ((s - a[0]) / (b[0] - a[0]));
    }
    return keys[keys.length - 1][1];
  };
})();
