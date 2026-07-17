import gsap from "gsap";
import { scrollProgress } from "./scroll.js";

const palette = {
  cream: "#f5ede3",
  blush: "#edd9d0",
  petal: "#e8c4c4",
  mist: "#d6b8b8",
  wine: "#7b1f3a",
  wineDeep: "#5a0f25",
};

function toRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function initAtmosphere(reduced) {
  const canvas = document.querySelector(".atmosphere");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const isMobile = window.matchMedia("(max-width: 899.98px)").matches;
  const pointer = { x: 0.5, y: 0.62, tx: 0.5, ty: 0.62 };
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    frame: 0,
    rafId: 0,
  };

  const resize = () => {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  };

  const drawBlob = (x, y, radius, color, alpha, blur = 90) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, toRgba(color, alpha));
    grad.addColorStop(0.55, toRgba(color, alpha * 0.45));
    grad.addColorStop(1, toRgba(color, 0));

    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const draw = (time) => {
    const { width, height } = state;
    ctx.clearRect(0, 0, width, height);

    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, palette.cream);
    base.addColorStop(0.54, palette.blush);
    base.addColorStop(1, palette.petal);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const driftScaleX = width * 0.07;
    const driftScaleY = height * 0.06;
    const pointerInfluenceX = (pointer.x - 0.5) * width * 0.08;
    const pointerInfluenceY = (pointer.y - 0.5) * height * 0.08;
    const scrollCool = 0.06 * scrollProgress();

    const blobs = [
      {
        x: width * 0.22 + Math.sin(time * 0.18) * driftScaleX + pointerInfluenceX * 0.35,
        y: height * 0.28 + Math.cos(time * 0.15) * driftScaleY + pointerInfluenceY * 0.35,
        radius: Math.max(width, height) * 0.34,
        color: palette.cream,
        alpha: 0.42,
        blur: 90,
      },
      {
        x: width * 0.72 + Math.cos(time * 0.14) * driftScaleX * 0.9 - pointerInfluenceX * 0.2,
        y: height * 0.32 + Math.sin(time * 0.18 + 0.9) * driftScaleY * 0.9 - pointerInfluenceY * 0.2,
        radius: Math.max(width, height) * 0.4,
        color: palette.petal,
        alpha: 0.38,
        blur: 110,
      },
      {
        x: width * 0.52 + Math.sin(time * 0.13 + 1.2) * driftScaleX * 0.7,
        y: height * 0.68 + Math.cos(time * 0.16 + 1.3) * driftScaleY * 0.8,
        radius: Math.max(width, height) * 0.32,
        color: palette.blush,
        alpha: 0.34,
        blur: 100,
      },
    ];

    ctx.globalCompositeOperation = "screen";
    blobs.forEach((blob) => drawBlob(blob.x, blob.y, blob.radius, blob.color, blob.alpha, blob.blur));

    const hover = ctx.createRadialGradient(
      pointer.x * width,
      pointer.y * height,
      0,
      pointer.x * width,
      pointer.y * height,
      Math.max(width, height) * 0.24,
    );
    hover.addColorStop(0, toRgba(palette.wine, 0.1));
    hover.addColorStop(0.4, toRgba(palette.wine, 0.045));
    hover.addColorStop(1, toRgba(palette.wine, 0));
    ctx.fillStyle = hover;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "multiply";
    const wash = ctx.createLinearGradient(0, height * 0.45, width, height);
    wash.addColorStop(0, toRgba(palette.mist, 0.1 + scrollCool));
    wash.addColorStop(1, toRgba(palette.wineDeep, 0.16 + scrollCool));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  };

  resize();
  window.addEventListener("resize", resize);

  if (reduced) {
    draw(0);
    return;
  }

  if (isMobile) {
    const loop = (time) => {
      if (document.hidden) {
        state.rafId = window.requestAnimationFrame(loop);
        return;
      }

      draw(time * 0.00045);
      state.rafId = window.requestAnimationFrame(loop);
    };

    state.rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(state.rafId);
  }

  window.addEventListener("pointermove", (event) => {
    pointer.tx = event.clientX / window.innerWidth;
    pointer.ty = 1 - event.clientY / window.innerHeight;
  });

  const loop = (time) => {
    if (document.hidden) {
      state.rafId = window.requestAnimationFrame(loop);
      return;
    }

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    draw(time * 0.00055);
    state.rafId = window.requestAnimationFrame(loop);
  };

  state.rafId = window.requestAnimationFrame(loop);

  return () => {
    window.cancelAnimationFrame(state.rafId);
  };
}
