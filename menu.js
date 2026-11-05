(function () {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  const scrim = document.getElementById("menuScrim");

  // Closed, the scrim and the links leave the page entirely: while they
  // are there, iOS Safari keeps the page from passing behind the clock.
  let hideTimer;

  function setOpen(open) {
    clearTimeout(hideTimer);
    if (open) {
      document.documentElement.style.setProperty(
        "--menu-tint",
        getComputedStyle(document.body).backgroundColor,
      );
      scrim.hidden = false;
      menu.hidden = false;
      void scrim.offsetWidth; // let the animation start from its closed state
    } else {
      hideTimer = setTimeout(() => {
        scrim.hidden = true;
        menu.hidden = true;
      }, 350);
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

// The header fades with the scroll instead of sliding away (see
// menu.css). Each pixel down fades it, each pixel up brings it back; stop
// and it settles: back to full if it was on its way up and mostly there,
// faded out otherwise.
(function () {
  const hdr = document.getElementById("hdr");
  if (hdr.classList.contains("hdr-solid")) return;

  const FADE_PX = 140; // scroll distance for a full fade
  const KEEP_FROM = 0.65; // opacity from which a scroll up settles visible
  const KEEP_NEAR_TOP = 40; // never settles hidden this close to the top
  const JUMP_PX = 250; // more than this in one event is a script, not a finger

  let opacity = 1;
  let goingUp = false;
  let touching = false;
  let settleTimer;

  function position() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(Math.max(window.pageYOffset, 0), max);
  }

  let lastY = position();

  function apply(value, animate) {
    opacity = value;
    hdr.style.transition = animate
      ? "opacity 0.3s ease, visibility 0s linear " + (value ? "0s" : "0.3s") + ", color 0.25s linear"
      : "";
    hdr.style.opacity = value;
    hdr.style.visibility = value ? "" : "hidden";
  }

  function settle() {
    if (touching || opacity === 1) return;
    const keep = position() < KEEP_NEAR_TOP || (goingUp && opacity >= KEEP_FROM);
    apply(keep ? 1 : 0, true);
  }

  // Also waits out the momentum after the finger has left the screen.
  function settleSoon() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 140);
  }

  window.addEventListener(
    "scroll",
    () => {
      const y = position();
      const dy = y - lastY;
      lastY = y;
      if (dy) goingUp = dy < 0;
      if (y === 0 || Math.abs(dy) > JUMP_PX) apply(1);
      else if (dy) apply(Math.min(Math.max(opacity - dy / FADE_PX, 0), 1));
      settleSoon();
    },
    { passive: true },
  );

  window.addEventListener(
    "touchstart",
    () => {
      touching = true;
      clearTimeout(settleTimer);
    },
    { passive: true },
  );
  ["touchend", "touchcancel"].forEach((type) => {
    window.addEventListener(
      type,
      () => {
        touching = false;
        settleSoon();
      },
      { passive: true },
    );
  });
})();
