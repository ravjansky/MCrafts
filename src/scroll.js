// One scroll system: ScrollSmoother rides the gsap ticker (single rAF), and
// this module is the velocity bus — the smoothed px/s figure every
// pliancy effect (field sway, marquee bend, atmosphere cool) reads from.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

let smoother = null;
let smoothedV = 0;

export function initScroll(reduced) {
  if (!reduced) {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      smoothTouch: false, // touch keeps native feel; triggers still run
    });

    gsap.ticker.add(() => {
      const raw = smoother ? smoother.getVelocity() : 0;
      smoothedV += (raw - smoothedV) * 0.12;
      if (Math.abs(smoothedV) < 0.1) smoothedV = 0;
    });
  }

  initAnchors(reduced);
  initNavInversion();
  return smoother;
}

export const getSmoother = () => smoother;

/** Smoothed scroll velocity in px/s (0 when reduced motion). */
export const velocity = () => smoothedV;

/** 0 at top of page, 1 at maximum scroll. */
export function scrollProgress() {
  const max = ScrollTrigger.maxScroll(window);
  if (!max) return 0;
  const top = smoother ? smoother.scrollTop() : window.scrollY;
  return gsap.utils.clamp(0, 1, top / max);
}

export function lockScroll(lock) {
  document.body.classList.toggle("is-loading", lock);
  if (smoother) smoother.paused(lock);
}

function initAnchors(reduced) {
  document.querySelectorAll("[data-scrollto]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (smoother) {
        smoother.scrollTo(target, true, "top top");
      } else {
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    });
  });
}

// The fixed nav inks itself cream while the wine statement passes under it.
function initNavInversion() {
  ScrollTrigger.create({
    trigger: ".statement",
    start: "top 8%",
    end: "bottom 8%",
    onToggle: (self) => document.body.classList.toggle("nav-on-wine", self.isActive),
  });
}
