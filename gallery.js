// Individual grid tiles/thumbnails fade + rise in as they scroll
// into view, instead of the whole grid popping in at once —
// each item is observed once and released as soon as it fires.
const itemRevealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            itemRevealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
      )
    : null;

function revealItem(node) {
  node.classList.add("reveal");
  if (itemRevealObserver) itemRevealObserver.observe(node);
  else node.classList.add("in");
}

// Thumbnails wipe in bottom-to-top the moment their own bytes are
// in, independent of the cell's scroll-in reveal above — so a
// slow image doesn't just pop once the cell has already settled.
function revealOnLoad(img) {
  img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
}

// Numbered thumbnails opening the lightbox. `allPhotos`/`offset` let
// several grids on one page (one per car) number and browse as one set.
function buildPhotoGrid(photos, title, allPhotos = photos, offset = 0) {
  const grid = el("div", "grid");
  photos.forEach((src, i) => {
    const n = offset + i;
    const cell = el("div", "grid-cell");
    cell.appendChild(el("span", "grid-idx", String(n + 1)));

    const btn = document.createElement("button");
    btn.type = "button";
    const thumb = el("div", "grid-thumb");
    const img = document.createElement("img");
    revealOnLoad(img);
    img.src = src;
    img.alt = title + " — photo " + (n + 1);
    img.dataset.lb = n;
    img.loading = "lazy";
    img.decoding = "async";
    thumb.appendChild(img);
    btn.appendChild(thumb);
    btn.addEventListener("click", () => openLightbox(allPhotos, n, img));
    cell.appendChild(btn);

    revealItem(cell);
    grid.appendChild(cell);
  });
  return grid;
}

// ============================================================
// LIGHTBOX — full-bleed photo viewer, arrow keys, swipe, esc
//
// The photo strip works exactly like the homepage's group
// carousel (see index.html): one absolutely-positioned <img> per
// photo, all laid out by a single function that only cares about
// each item's offset from the active index — centered at 0, a
// sliver peeking in at ±1, parked off-screen everywhere else.
// Changing the active index just recomputes that layout; the
// slide is the CSS transition animating between the old and new
// transform, not a JS-driven animation.
//
// Opening/closing additionally morphs the clicked thumbnail into
// the centered photo (and back) via the View Transitions API's
// shared-element matching — both images briefly carry the same
// view-transition-name, one in the "old" tree and one in the
// "new" tree, and the browser interpolates between them.
// ============================================================
const lb = document.getElementById("lb");
const lbStage = document.getElementById("lbStage");
const lbCounter = document.getElementById("lbCounter");
let lbPhotos = [];
let lbItems = []; // one <img> per photo, index-aligned with lbPhotos
let lbIndex = 0;

// The grid stays mounted under the lightbox, so the thumbnail for any
// index is still on the page; a layout may have reordered it.
function findThumbImg(index) {
  return document.querySelector('.grid img[data-lb="' + index + '"]');
}

function lbSliverWidth() {
  return window.innerWidth < 700 ? 28 : 48;
}

// Shortest signed distance from `active` to `k`, wrapping around
// both ends of the array — so the photo after the last one is
// the first, and vice versa, and a sliver is always there to peek
// at no matter where in the set the active photo sits.
function wrapOffset(k, active, n) {
  let offset = k - active;
  if (offset > n / 2) offset -= n;
  else if (offset < -n / 2) offset += n;
  return offset;
}

function layoutLightbox() {
  const W = lbStage.clientWidth;
  const S = lbSliverWidth();
  const n = lbItems.length;
  lbItems.forEach((img, k) => {
    const offset = wrapOffset(k, lbIndex, n);
    const w = img.offsetWidth;
    let tx, op;
    if (offset === 0) {
      tx = (W - w) / 2;
      op = 1;
    } else if (offset === 1) {
      tx = W - S;
      op = 1;
    } else if (offset === -1) {
      tx = S - w;
      op = 1;
    } else if (offset > 1) {
      tx = W + 40;
      op = 0;
    } else {
      tx = -w - 40;
      op = 0;
    }
    img.style.transform = "translate3d(" + tx + "px, -50%, 0)";
    img.style.opacity = op;
  });
}

// Only the active photo and its immediate neighbours need real
// pixels — everything else stays an empty <img> (data-src) until
// browsing brings it within range, so opening a 45-photo gallery
// doesn't fetch 45 full-resolution photos at once.
const LB_PRELOAD = 2;
function promoteLightbox() {
  const n = lbItems.length;
  lbItems.forEach((img, k) => {
    if (Math.abs(wrapOffset(k, lbIndex, n)) > LB_PRELOAD) return;
    if (!img.dataset.src) return;
    img.src = img.dataset.src;
    delete img.dataset.src;
  });
}

function buildLightboxItems(photos) {
  lbStage.innerHTML = "";
  lbItems = photos.map((src, k) => {
    const img = document.createElement("img");
    img.className = "lb-item";
    img.alt = "Photo " + (k + 1) + " sur " + photos.length;
    img.decoding = "async";
    img.dataset.src = src;
    // Position/opacity are computed from the image's own size, which
    // isn't known until it loads — re-run the (animated) layout once
    // it does, or a photo that was still fetching settles into place
    // a beat late instead of landing where it belongs from the
    // start. Deliberately NOT the instant/no-anim version: that
    // forces transition:none on every item for a couple of frames,
    // and if a load happens to land mid-swipe it freezes whatever
    // slide is currently in flight — the swipe reads as instant
    // instead of animated. A plain re-layout only changes the
    // transform of the item whose size just became known; every
    // other item gets the same target it already had, which is a
    // no-op for an in-progress transition, not an interruption.
    img.addEventListener(
      "load",
      () => {
        if (lb.classList.contains("open")) layoutLightbox();
      },
      { once: true },
    );
    lbStage.appendChild(img);
    return img;
  });
}

// Snaps everything into its target position/opacity with no
// transition (used on open and on resize), instead of letting it
// slide in from each item's untouched default position.
function layoutLightboxInstant() {
  lbStage.classList.add("lb-no-anim");
  layoutLightbox();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => lbStage.classList.remove("lb-no-anim")),
  );
}

function showLbIndex(i) {
  const n = lbPhotos.length;
  const next = ((i % n) + n) % n;
  if (next === lbIndex) return;
  lbIndex = next;
  promoteLightbox();
  layoutLightbox();
  lbCounter.textContent = lbIndex + 1 + " / " + lbPhotos.length;
}

function openLightbox(photos, i, thumbImg) {
  lbPhotos = photos;
  lbIndex = (i + photos.length) % photos.length;
  document.body.style.overflow = "hidden";

  buildLightboxItems(photos);
  promoteLightbox();
  const activeImg = lbItems[lbIndex];

  const apply = () => {
    lb.classList.add("open");
    layoutLightboxInstant();
    lbCounter.textContent = lbIndex + 1 + " / " + lbPhotos.length;
  };

  if (thumbImg && document.startViewTransition) {
    thumbImg.style.viewTransitionName = "lb-photo";
    const transition = document.startViewTransition(() => {
      activeImg.style.viewTransitionName = "lb-photo";
      apply();
      thumbImg.style.viewTransitionName = "";
    });
    // A rapid second interaction (e.g. closing before this one
    // settles) skips it; every promise on the transition object
    // rejects independently, so each needs its own no-op catch
    // or it surfaces as an unhandled rejection.
    transition.updateCallbackDone.catch(() => {});
    transition.ready.catch(() => {});
    transition.finished.catch(() => {}).finally(() => {
      activeImg.style.viewTransitionName = "";
    });
  } else {
    apply();
  }
}

function closeLightbox() {
  const thumbImg = findThumbImg(lbIndex);
  const activeImg = lbItems[lbIndex];
  document.body.style.overflow = "";

  const apply = () => lb.classList.remove("open");

  if (thumbImg && activeImg && document.startViewTransition) {
    activeImg.style.viewTransitionName = "lb-photo";
    const transition = document.startViewTransition(() => {
      thumbImg.style.viewTransitionName = "lb-photo";
      apply();
      activeImg.style.viewTransitionName = "";
    });
    transition.updateCallbackDone.catch(() => {});
    transition.ready.catch(() => {});
    transition.finished.catch(() => {}).finally(() => {
      thumbImg.style.viewTransitionName = "";
    });
  } else {
    apply();
  }
}

document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", () => showLbIndex(lbIndex - 1));
document.getElementById("lbNext").addEventListener("click", () => showLbIndex(lbIndex + 1));

window.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowRight") showLbIndex(lbIndex + 1);
  else if (e.key === "ArrowLeft") showLbIndex(lbIndex - 1);
});

let lbTouchX = 0;
lb.addEventListener(
  "touchstart",
  (e) => {
    lbTouchX = e.touches[0].clientX;
  },
  { passive: true },
);
lb.addEventListener(
  "touchend",
  (e) => {
    const dx = e.changedTouches[0].clientX - lbTouchX;
    if (Math.abs(dx) < 40) return;
    showLbIndex(lbIndex + (dx < 0 ? 1 : -1));
  },
  { passive: true },
);

// Keeps the carousel's pixel-based layout correct across
// orientation changes / window resizes while it's open.
window.addEventListener("resize", () => {
  if (lb.classList.contains("open")) layoutLightboxInstant();
});
