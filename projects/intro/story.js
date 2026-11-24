// Introduction page: each project button jumps straight to that project, the same
// way the indicator on the right does (shared/nav.js).
(() => {
  document.querySelectorAll("#intro .projects button").forEach((b) => b.addEventListener("click", () => {
    document.querySelector(`.pnav button[data-id="${b.dataset.go}"]`)?.click();
  }));
})();
