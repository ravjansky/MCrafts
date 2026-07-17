// Hero — the loader hands off here. Whisper → headline word-lift → CTA →
// rail → star (the system's choreography order), then the ambient tier:
// one slow star rotation and a scrub-bound counter-drift in the portrait.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { EASE } from "./ease.js";

let heroSplit = null;

const NAV_ITEMS = ".site-nav .brand-lockup, .site-nav .nav-link, .site-nav .nav-pill";

/** Park every hero element outside its mask before the overlay lifts. */
export function initHeroStates() {
  heroSplit = SplitText.create(".hero-headline", { type: "words", mask: "words" });
  gsap.set(heroSplit.words, { yPercent: 110 });

  gsap.set(NAV_ITEMS, { autoAlpha: 0, y: 12 });
  gsap.set('[data-hero="whisper"]', { autoAlpha: 0, y: 14 });
  gsap.set('[data-hero="cta"] > *', { autoAlpha: 0, y: 14 });
  gsap.set('[data-hero="cue"]', { autoAlpha: 0 });
  gsap.set('[data-hero="rail"]', { autoAlpha: 0, x: 14 });
  gsap.set('[data-hero="star"]', {
    autoAlpha: 0,
    scale: 0.5,
    rotation: -30,
    transformOrigin: "50% 50%",
  });
  gsap.set(".hero-figure .frame-mask", { autoAlpha: 0 });
  gsap.set(".hero-figure figcaption", { autoAlpha: 0, y: 10 });
}

export function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: EASE.signature } });

  tl.to('[data-hero="whisper"]', { autoAlpha: 1, y: 0, duration: 0.55 }, 0)
    .to(NAV_ITEMS, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.05)
    .to(
      heroSplit.words,
      {
        yPercent: 0,
        duration: 0.85,
        stagger: 0.05,
        onComplete: () => heroSplit.revert(),
      },
      0.12,
    )
    .to('[data-hero="cta"] > *', { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.8)
    .to('[data-hero="cue"]', { autoAlpha: 1, duration: 0.5 }, 0.95)
    .to('[data-hero="rail"]', { autoAlpha: 1, x: 0, duration: 0.7 }, 1.0)
    .to(".hero-figure figcaption", { autoAlpha: 1, y: 0, duration: 0.6 }, 1.05)
    .to('[data-hero="star"]', { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7 }, 1.15)
    .add(() => {
      // ambient tier — the one infinite loop this viewport is allowed
      gsap.to('[data-hero="star"]', { rotation: "+=360", duration: 60, ease: EASE.loop, repeat: -1 });
    });

  return tl;
}

export function initHeroScroll() {
  // the portrait counter-drifts inside its frame as the hero scrolls away
  gsap.fromTo(
    ".hero-figure .img-inner",
    { yPercent: 2.5, scale: 1.06 },
    {
      yPercent: -2.5,
      scale: 1.06,
      ease: EASE.none,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
      },
    },
  );

  // the scroll cue has said its piece once you move
  const cueHide = gsap.to('[data-hero="cue"]', {
    autoAlpha: 0,
    duration: 0.25,
    ease: EASE.smooth,
    paused: true,
    overwrite: "auto",
  });
  ScrollTrigger.create({
    start: 60,
    end: "max",
    onEnter: () => cueHide.play(),
    onLeaveBack: () => cueHide.reverse(),
  });
}
