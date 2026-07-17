// The intro: the botanical M draws itself like wire being bent, the wine
// hairline tracks progress, then one continuous cream world — the overlay
// wipes away invisibly and five product prints glide in on a single rail.
// Four exit; the centre print flexes into the hero frame and becomes it.
import gsap from "gsap";
import { EASE, DUR } from "./ease.js";

const ROTATIONS = [-15, 5, -7.5, 10, -2.5];
const GAP_VW = 2.5;

export function runLoader({ onHeroMoment, onComplete }) {
  const logoSVG = document.querySelector(".preloader-logo");
  const layer = document.querySelector(".intro-layer");
  const tiles = gsap.utils.toArray(".intro-tile");
  const heroTile = document.querySelector(".intro-tile--hero");
  const heroMask = document.querySelector(".hero-figure .frame-mask");

  // ── tile geometry — every transform is relative to the tile's centre ──
  gsap.set(layer, { visibility: "visible" });

  const tileW = tiles[0].offsetWidth;
  const gap = (window.innerWidth * GAP_VW) / 100;
  const rowW = tileW * 5 + gap * 4;
  const centeredX = (i) => i * (tileW + gap) + tileW / 2 - rowW / 2;

  tiles.forEach((tile, i) => {
    gsap.set(tile, {
      xPercent: -50,
      yPercent: -50,
      x: centeredX(i) - window.innerWidth * 1.3,
      rotation: ROTATIONS[i],
    });
  });

  // ── stroke preparation (the monogram mechanics, kept intact) ──────────
  const logoLengthMap = {};
  logoSVG.querySelectorAll("defs path[id]").forEach((path) => {
    logoLengthMap[path.id] = path.getTotalLength();
  });

  // dasharray alternates dash/gap forever, so an even `length length`
  // pattern leaves a dash butted against each end of the path and its
  // round cap bulges back into view. Give the gap an extra cap's worth
  // of room at both ends and park the path inside it: at the starting
  // offset nothing renders at all, at offset 0 the dash covers the path.
  const prepareStroke = (el, length) => {
    const cap = parseFloat(getComputedStyle(el).strokeWidth) / 2 + 2;
    gsap.set(el, {
      strokeDasharray: `${length} ${length + cap * 2}`,
      strokeDashoffset: length + cap,
    });
  };

  const outlineStrokes = {};
  logoSVG.querySelectorAll(".logo-outline use").forEach((use) => {
    const id = use.getAttribute("href").slice(1);
    outlineStrokes[id] = use;
    prepareStroke(use, logoLengthMap[id]);
  });

  const colorStrokes = {};
  logoSVG.querySelectorAll(".logo-color use").forEach((use) => {
    const id = use.getAttribute("href").slice(1);
    colorStrokes[id] = use;
    prepareStroke(use, logoLengthMap[id]);
  });

  const detailPaths = logoSVG.querySelectorAll("path.logo-stroke");
  detailPaths.forEach((path) => prepareStroke(path, path.getTotalLength()));

  const leaves = logoSVG.querySelectorAll(".logo-leaf");
  const berries = logoSVG.querySelectorAll(".logo-dots circle, .logo-berries circle");
  gsap.set([...leaves, ...berries], {
    autoAlpha: 0,
    scale: 0,
    transformOrigin: "50% 50%",
  });

  gsap.set(".preloader-caption", { autoAlpha: 0, y: 12 });

  // Every piece is hidden now, so the content layer can be shown
  gsap.set(".preloader-content", { autoAlpha: 1 });

  const tl = gsap.timeline({ delay: 0.4 });
  tl.addLabel("draw", 0);

  // Choreography: the two pillars rise together, the valley sweeps
  // between them, the curls unfurl outward, the small spirals coil
  // last. The gradient ink chases each brown outline down its path.
  const strokeOrder = [
    { ids: ["a", "b"], at: 0, duration: 1.4 },
    { ids: ["c"], at: 0.5, duration: 1.5 },
    { ids: ["d", "e"], at: 1.4, duration: 0.9 },
    { ids: ["f", "g"], at: 1.8, duration: 0.9 },
    { ids: ["h", "i"], at: 2.3, duration: 0.6 },
    { ids: ["j", "k"], at: 2.6, duration: 0.6 },
  ];
  const inkDelay = 0.35;

  strokeOrder.forEach(({ ids, at, duration }) => {
    ids.forEach((id) => {
      tl.to(
        outlineStrokes[id],
        { strokeDashoffset: 0, duration, ease: EASE.smooth },
        `draw+=${at}`,
      );
      tl.to(
        colorStrokes[id],
        { strokeDashoffset: 0, duration, ease: EASE.smooth },
        `draw+=${at + inkDelay}`,
      );
    });
  });

  tl.to(
    detailPaths,
    { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: EASE.smooth },
    "draw+=2.9",
  );

  tl.to(
    leaves,
    { autoAlpha: 1, scale: 1, duration: 0.55, stagger: 0.09, ease: EASE.signature },
    "draw+=3.5",
  );

  tl.to(
    berries,
    { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: EASE.signature },
    "draw+=3.95",
  );

  tl.to(
    ".preloader-caption",
    { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE.signature },
    "draw+=0.6",
  );

  // The wine hairline tracks the drawing, 0 to 100
  tl.to(
    ".preloader",
    {
      scaleX: 1,
      duration: 5,
      ease: EASE.smooth,
      onComplete: () => {
        gsap.set(".preloader", { transformOrigin: "right" });
      },
    },
    "draw",
  );

  // A small breath once the mark is complete
  tl.to(".preloader-logo", { scale: 1.03, duration: 0.3, ease: EASE.smooth }, "draw+=5.05");
  tl.to(".preloader-logo", { scale: 1, duration: 0.4, ease: EASE.smooth });

  tl.to(
    ".preloader-content, .preloader-caption",
    { autoAlpha: 0, duration: 0.5, ease: EASE.smooth },
    "draw+=5.45",
  );
  tl.to(".preloader", { scaleX: 0, duration: 0.9, ease: EASE.signature }, "draw+=5.55");

  // Cream wipes off cream — an invisible seam. The prints ARE the reveal.
  tl.to(
    ".preloader-overlay",
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      ease: EASE.signature,
      onComplete: () => gsap.set(".preloader-overlay", { display: "none" }),
    },
    "<0.55",
  );

  tiles.forEach((tile, i) => {
    tl.to(
      tile,
      { x: centeredX(i), duration: 1.5, ease: EASE.signature },
      "<0.03",
    );
  });

  // the hand of cards holds for a breath…
  tl.addLabel("spread", "+=0.35");

  tl.to(
    '.intro-tile[data-exit="left"]',
    { x: `-=${window.innerWidth * 1.25}`, duration: 1.4, ease: EASE.signature },
    "spread",
  );
  tl.to(
    '.intro-tile[data-exit="right"]',
    { x: `+=${window.innerWidth * 1.25}`, duration: 1.4, ease: EASE.signature },
    "spread",
  );

  // …then the centre print un-bends and flexes into the hero frame
  tl.to(heroTile, { rotation: 0, duration: 0.35, ease: EASE.smooth }, "spread");

  tl.add(() => {
    const r = heroMask.getBoundingClientRect();
    gsap.to(heroTile, {
      x: r.left + r.width / 2 - window.innerWidth / 2,
      y: r.top + r.height / 2 - window.innerHeight / 2,
      scale: r.width / tileW,
      duration: DUR.slow,
      ease: EASE.signature,
      onComplete: () => {
        gsap.set(heroMask, { autoAlpha: 1 });
        gsap.set(layer, { display: "none" });
        onComplete?.();
      },
    });
  }, "spread+=0.4");

  tl.add(() => onHeroMoment?.(), "spread+=0.85");

  return tl;
}
