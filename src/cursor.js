// Cursor physics — interactive elements have weight and lag. Fine pointers
// only; touch gets its considered :active states in CSS instead.
import gsap from "gsap";
import { EASE } from "./ease.js";

const MAX_PULL = 12; // px — magnetism whispers, never shouts

export function initCursor(reduced) {
  if (reduced || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".magnetic").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: EASE.smooth });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: EASE.smooth });

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      xTo(gsap.utils.clamp(-MAX_PULL, MAX_PULL, relX * 0.35));
      yTo(gsap.utils.clamp(-MAX_PULL, MAX_PULL, relY * 0.35));
    });

    el.addEventListener("mouseleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}
