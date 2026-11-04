(function () {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  const scrim = document.getElementById("menuScrim");

  // Closed, the scrim leaves the page entirely: iOS Safari tints the area
  // around the Dynamic Island from full-screen fixed elements, and would
  // take its colour instead of the page's.
  let hideTimer;

  function setOpen(open) {
    clearTimeout(hideTimer);
    if (open) {
      document.documentElement.style.setProperty(
        "--menu-tint",
        getComputedStyle(document.body).backgroundColor,
      );
      scrim.hidden = false;
      void scrim.offsetWidth; // let the fade start from its closed state
    } else {
      hideTimer = setTimeout(() => (scrim.hidden = true), 350);
    }
    btn.setAttribute("aria-expanded", open);
    menu.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
  }

  function isOpen() {
    return menu.classList.contains("is-open");
  }

  btn.addEventListener("click", () => setOpen(!isOpen()));
  scrim.addEventListener("click", () => setOpen(false));
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      btn.focus();
    }
  });

  // The header slides away on scroll, so the menu can't stay open
  // through one.
  window.addEventListener(
    "scroll",
    () => {
      if (isOpen()) setOpen(false);
    },
    { passive: true },
  );
})();
