// The Garden — the signature scene. Sixteen prints scattered over 520vh,
// each drifting at its own velocity (amp × lag), each un-bending into view
// through a clip mask, and every one of them leaning with scroll velocity
// like stems in one breeze. Placement lanes + bounded amplitudes guarantee
// prints never cross each other.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR } from "./ease.js";
import { velocity } from "./scroll.js";

export function initField(reduced) {
  if (reduced) return; // items rest at their placed positions

  const items = gsap.utils.toArray(".field-item");
  const words = gsap.utils.toArray(".field-word");
  if (!items.length) return;

  const mm = gsap.matchMedia();

  mm.add({ desktop: "(min-width: 900px)", mobile: "(max-width: 899.98px)" }, (ctx) => {
    const ampScale = ctx.conditions.desktop ? 1 : 0.4;

    items.forEach((item) => {
      const amp = (parseFloat(item.dataset.amp) || 12) * ampScale;
      // the design law: scrub never below 1.5 — remap the authored spread
      const scrub = gsap.utils.mapRange(
        1,
        2.4,
        1.5,
        2.75,
        parseFloat(item.dataset.scrub) || 1.5,
      );

      gsap.fromTo(
        item,
        { y: () => (amp * window.innerHeight) / 100 },
        {
          y: () => (-amp * window.innerHeight) / 100,
          ease: EASE.none,
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub,
            invalidateOnRefresh: true,
          },
        },
      );

      const mask = item.querySelector(".frame-mask");
      const img = item.querySelector(".img-inner");
      const caption = item.querySelector("figcaption");

      const tl = gsap.timeline({
        defaults: { ease: EASE.signature },
        scrollTrigger: { trigger: item, start: "top 88%", once: true },
      });
      tl.fromTo(
        mask,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: DUR.slow },
        0,
      )
        .fromTo(
          img,
          { scale: 1.14, yPercent: -6 },
          {
            scale: 1,
            yPercent: 0,
            duration: DUR.slow,
            // hand the inner image back to CSS so the hover warmth can breathe
            onComplete: () => gsap.set(img, { clearProps: "transform" }),
          },
          0,
        )
        .fromTo(caption, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.55);
    });

    // family watermarks sink slowly behind the prints
    words.forEach((word) => {
      gsap.fromTo(
        word,
        { y: () => window.innerHeight * 0.1 },
        {
          y: () => window.innerHeight * -0.1,
          ease: EASE.none,
          scrollTrigger: {
            trigger: word,
            start: "top bottom",
            end: "bottom top",
            scrub: 2.75,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    // pliancy — every stem leans with scroll velocity, per its flexibility
    const sway = items.map((item) => ({
      set: gsap.quickSetter(item, "skewY", "deg"),
      flex: parseFloat(item.dataset.flex) || 1,
    }));
    const lean = () => {
      const s = gsap.utils.clamp(-2.4, 2.4, velocity() / 900);
      for (const o of sway) o.set(s * o.flex);
    };
    gsap.ticker.add(lean);

    return () => {
      gsap.ticker.remove(lean);
      sway.forEach((o) => o.set(0));
    };
  });
}
