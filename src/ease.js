// The four easing tokens — registered once for GSAP from the SAME control
// points as the CSS variables, so CSS and JS share one identical curve.
// No other ease may appear anywhere in this codebase.
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

// cubic-bezier(x1,y1,x2,y2) → SVG path "M0,0 C x1,y1 x2,y2 1,1"
CustomEase.create("signature", "M0,0 C0.22,1 0.36,1 1,1"); // --ease-signature
CustomEase.create("smooth", "M0,0 C0.4,0 0.2,1 1,1"); // --ease-smooth

export const EASE = {
  signature: "signature",
  smooth: "smooth",
  none: "none", // state flips, scrubs
  loop: "none", // infinite loops only — linear + duration control
};

export const DUR = {
  micro: 0.25,
  fast: 0.5,
  mid: 0.8,
  slow: 1.2,
  cinematic: 1.8,
  ambient: 4,
};
