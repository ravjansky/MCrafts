// Scrolled scenes. Every section follows the one choreography: whisper →
// headline word-lift → body → visual clip-release → motif last. Splits are
// reverted after each reveal so the DOM returns to clean, reflowable text.
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { EASE, DUR } from "./ease.js";
import { velocity } from "./scroll.js";

const splitWords = (target) => SplitText.create(target, { type: "words", mask: "words" });

const whisperIn = (tl, target, pos) =>
  tl.fromTo(target, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, pos);

const liftIn = (tl, split, pos, dur = 0.85, stagger = 0.045) =>
  tl.fromTo(
    split.words,
    { yPercent: 110 },
    { yPercent: 0, duration: dur, stagger, onComplete: () => split.revert() },
    pos,
  );

export function initSections(reduced) {
  if (reduced) return; // content already rests in its final state

  buildStory();
  buildGardenHead();
  buildStatement();
  buildOrder();
  buildContact();
}

/* ── 02 · Story ─────────────────────────────────────────── */
function buildStory() {
  const headline = splitWords(".story .headline");
  const body = SplitText.create(".story .body-copy p", { type: "lines", mask: "lines" });

  const tl = gsap.timeline({
    defaults: { ease: EASE.signature },
    scrollTrigger: { trigger: ".story", start: "top 72%", once: true },
  });

  whisperIn(tl, ".story .section-whisper", 0);
  liftIn(tl, headline, 0.12);
  tl.fromTo(
    body.lines,
    { yPercent: 110 },
    { yPercent: 0, duration: 0.75, stagger: 0.06, onComplete: () => body.revert() },
    1.05,
  );
  tl.fromTo(
    ".story-figure .frame-mask",
    { clipPath: "inset(100% 0 0 0)" },
    { clipPath: "inset(0% 0 0 0)", duration: DUR.slow },
    1.2,
  );
  tl.fromTo(
    ".story-figure .img-inner",
    { scale: 1.18, yPercent: -8 },
    { scale: 1.06, yPercent: 0, duration: DUR.slow },
    1.2,
  );
  whisperIn(tl, ".story-figure figcaption", 1.85);
  whisperIn(tl, ".story .quiet-link", 1.95);
  tl.fromTo(".story-copy .rule", { scaleX: 0 }, { scaleX: 1, duration: DUR.slow }, 2.0);

  // after landing, the figure keeps a slow counter-drift — pliancy at rest
  gsap.fromTo(
    ".story-figure",
    { y: 30 },
    {
      y: -30,
      ease: EASE.none,
      scrollTrigger: {
        trigger: ".story-figure",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    },
  );
}

/* ── 03 · Garden head ───────────────────────────────────── */
function buildGardenHead() {
  const headline = splitWords(".garden-head .headline");

  const tl = gsap.timeline({
    defaults: { ease: EASE.signature },
    scrollTrigger: { trigger: ".garden", start: "top 72%", once: true },
  });

  whisperIn(tl, ".garden-head .section-whisper", 0);
  liftIn(tl, headline, 0.12);
  whisperIn(tl, ".garden-note", 0.9);
}

/* ── 04 · Statement (wine) ──────────────────────────────── */
function buildStatement() {
  const headline = splitWords(".statement-headline");

  const tl = gsap.timeline({
    defaults: { ease: EASE.signature },
    scrollTrigger: { trigger: ".statement", start: "top 78%", once: true },
  });

  // the wine surface sweeps up like ribbon laid over the page
  tl.fromTo(
    ".statement-bg",
    { clipPath: "inset(100% 0 0 0)" },
    { clipPath: "inset(0% 0 0 0)", duration: DUR.slow },
    0,
  );
  whisperIn(tl, ".statement .section-whisper", 0.55);
  liftIn(tl, headline, 0.7);
  tl.fromTo(
    ".statement-star",
    { autoAlpha: 0, scale: 0.55, rotation: -35, transformOrigin: "50% 50%" },
    { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7 },
    1.6,
  );
  tl.fromTo(".marquee", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: EASE.smooth }, 1.55);

  // the marquee is a wire loop: velocity speeds it, scrolling up bends it
  // backwards. A wrapped setter (rather than a tween) so negative speed
  // loops seamlessly. One infinite loop for this viewport; 45s base cycle.
  const setX = gsap.quickSetter(".marquee-track", "xPercent");
  const wrap = gsap.utils.wrap(-50, 0);
  const BASE = -50 / 45; // xPercent per second — EASE.loop by construction
  let pos = 0;
  let speed = 1;
  gsap.ticker.add(() => {
    const target = gsap.utils.clamp(-2, 3.2, 1 + velocity() / 1600);
    speed += (target - speed) * 0.06;
    pos = wrap(pos + BASE * speed * (gsap.ticker.deltaRatio(60) / 60));
    setX(pos);
  });
}

/* ── 05 · Order ─────────────────────────────────────────── */
function buildOrder() {
  const headline = splitWords(".order .headline");

  const tl = gsap.timeline({
    defaults: { ease: EASE.signature },
    scrollTrigger: { trigger: ".order", start: "top 72%", once: true },
  });

  whisperIn(tl, ".order .section-whisper", 0);
  liftIn(tl, headline, 0.12);

  gsap.utils.toArray(".order-step").forEach((step) => {
    const stepTl = gsap.timeline({
      defaults: { ease: EASE.signature },
      scrollTrigger: { trigger: step, start: "top 82%", once: true },
    });
    stepTl
      .fromTo(
        step.querySelector(".step-rule"),
        { scaleX: 0 },
        { scaleX: 1, duration: DUR.slow },
        0,
      )
      .fromTo(
        step.querySelector(".step-num"),
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.7 },
        0.1,
      )
      .fromTo(
        step.querySelector(".step-title"),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.65 },
        0.2,
      )
      .fromTo(
        step.querySelector(".step-copy p"),
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.6 },
        0.32,
      );
  });

  gsap.fromTo(
    ".order-reminder",
    { autoAlpha: 0, y: 14 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      ease: EASE.signature,
      scrollTrigger: { trigger: ".order-reminder", start: "top 88%", once: true },
    },
  );
}

/* ── 06 · Contact / footer ──────────────────────────────── */
function buildContact() {
  const headline = splitWords(".contact-link");

  const tl = gsap.timeline({
    defaults: { ease: EASE.signature },
    scrollTrigger: { trigger: ".contact", start: "top 72%", once: true },
  });

  whisperIn(tl, ".contact .section-whisper", 0);
  liftIn(tl, headline, 0.12, 0.9, 0.06);
  whisperIn(tl, ".contact-availability", 0.95);
  tl.fromTo(
    ".pill-row .pill",
    { autoAlpha: 0, y: 16 },
    { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
    1.05,
  );
  tl.fromTo(".contact-meta", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 1.3);
  tl.fromTo(".vrail--contact", { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.7 }, 1.35);
}
