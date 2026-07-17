// MCrafts — The Atelier of Soft Wire
// One material law (pliancy), four easing tokens, one rAF loop.
// See MOTION_SPEC.md for the full Motion DNA.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

import "./src/ease.js"; // registers the signature/smooth tokens for GSAP
import { initAtmosphere } from "./src/atmosphere.js";
import { initScroll, lockScroll } from "./src/scroll.js";
import { initCursor } from "./src/cursor.js";
import { runLoader } from "./src/loader.js";
import { initHeroStates, heroIntro, initHeroScroll } from "./src/hero.js";
import { initField } from "./src/field.js";
import { initSections } from "./src/sections.js";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  if (!REDUCED) document.body.classList.add("is-loading");

  document.fonts.ready.then(() => {
    initAtmosphere(REDUCED);
    initScroll(REDUCED);
    initCursor(REDUCED);

    if (REDUCED) {
      // Reduced motion is a rendering mode, not a downgrade: the loader and
      // intro layer are hidden in CSS, nothing was ever parked off-screen,
      // and the page simply *is* — final states, native scroll, stillness.
      return;
    }

    initHeroStates();
    initHeroScroll();
    initSections(REDUCED);
    initField(REDUCED);

    lockScroll(true);
    runLoader({
      onHeroMoment: heroIntro,
      onComplete: () => {
        lockScroll(false);
        ScrollTrigger.refresh();
      },
    });
  });
});
