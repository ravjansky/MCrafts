// The ambient layer: a breathing cream→blush→petal noise field, per the
// Quiet Editorial SHADER_CONFIG. Dependency-free raw WebGL (~4kb) because
// the effect is, essentially, breathing — anything heavier is against the
// system. Renders on the shared gsap ticker; one rAF for the whole site.
import gsap from "gsap";
import { scrollProgress } from "./scroll.js";

const SHADER_CONFIG = {
  noiseScale: 0.8, // lower = larger blobs of color
  noiseSpeed: 0.0003, // time multiplier per frame
  colorA: [0.961, 0.929, 0.89], // cream
  colorB: [0.933, 0.851, 0.816], // blush
  colorC: [0.91, 0.769, 0.769], // petal
  hoverWarmth: 0.15, // max glow intensification at cursor
  scrollCoolShift: 0.08, // hue cool-shift over full page scroll
};

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uScroll;
uniform float uHoverIntensity;

const vec3 CREAM = vec3(${SHADER_CONFIG.colorA.join(",")});
const vec3 BLUSH = vec3(${SHADER_CONFIG.colorB.join(",")});
const vec3 PETAL = vec3(${SHADER_CONFIG.colorC.join(",")});
const vec3 MIST  = vec3(0.839, 0.722, 0.722);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(11.3, 7.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 st = uv;
  st.x *= uResolution.x / uResolution.y;

  float t = uTime * ${SHADER_CONFIG.noiseSpeed.toFixed(6)};

  // soft domain warp — velvet fog, never geometry
  float q1 = fbm(st * ${SHADER_CONFIG.noiseScale.toFixed(2)} + t * vec2(0.7, -0.4));
  float q2 = fbm(st * ${SHADER_CONFIG.noiseScale.toFixed(2)} + t * vec2(-0.3, 0.6) + vec2(5.2, 1.3));
  vec2 warped = st * ${SHADER_CONFIG.noiseScale.toFixed(2)} + 0.55 * vec2(q1, q2) + t * vec2(0.5, 0.3);

  float n = fbm(warped);
  vec3 col = mix(CREAM, BLUSH, smoothstep(0.25, 0.8, n));

  float n2 = fbm(warped * 1.6 - t * 1.2 + vec2(3.1, 1.7));
  col = mix(col, PETAL, smoothstep(0.55, 0.95, n2) * 0.72);

  // the cursor is a warm hand
  float d = distance(uv, uMouse);
  float glow = exp(-d * 4.0) * ${SHADER_CONFIG.hoverWarmth.toFixed(3)} * uHoverIntensity;
  col = mix(col, PETAL, glow);

  // the page cools as you descend
  col = mix(col, MIST, uScroll * ${(SHADER_CONFIG.scrollCoolShift * 2.4).toFixed(3)});

  gl_FragColor = vec4(col, 1.0);
}`;

export function initAtmosphere(reduced) {
  const canvas = document.querySelector(".atmosphere");
  if (!canvas) return;

  try {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("no webgl");

    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "shader compile failed");
      }
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "program link failed");
    }
    gl.useProgram(program);

    // one triangle that covers the screen
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const U = {
      time: gl.getUniformLocation(program, "uTime"),
      resolution: gl.getUniformLocation(program, "uResolution"),
      mouse: gl.getUniformLocation(program, "uMouse"),
      scroll: gl.getUniformLocation(program, "uScroll"),
      hover: gl.getUniformLocation(program, "uHoverIntensity"),
    };

    const mouse = { x: 0.5, y: 0.62, tx: 0.5, ty: 0.62 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.resolution, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    gl.uniform1f(U.hover, 1);

    const render = (timeMs) => {
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      gl.uniform1f(U.time, timeMs);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.uniform1f(U.scroll, scrollProgress());
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduced) {
      render(60000); // one considered frame, then stillness
      return;
    }

    window.addEventListener("pointermove", (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    });

    gsap.ticker.add((time) => {
      if (document.hidden) return;
      render(time * 1000);
    });
  } catch (err) {
    // WebGL bowed out — the CSS radial gradient on <html> carries the room
    canvas.remove();
  }
}
