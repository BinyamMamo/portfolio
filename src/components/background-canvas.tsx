'use client';

import { useEffect, useRef } from 'react';

/** Recent pointer samples kept for the disturbance. Must match MAX_POINTS in the shader. */
const MAX_POINTS = 24;
/** Seconds a pointer sample keeps disturbing the gradient. Must match LIFETIME in the shader. */
const LIFETIME_S = 1.6;
const SAMPLE_INTERVAL_MS = 20;
/** Pointer speed cap in viewport heights per second, so flicks do not tear the gradient apart. */
const MAX_SPEED = 4;
/** How quickly the tracked velocity follows the pointer (0 to 1). Lower is smoother and slower. */
const VELOCITY_SMOOTHING = 0.25;
/** The gradient is soft, so rendering below native resolution is invisible and much cheaper. */
const RENDER_SCALE = 0.5;
const IDLE_FRAME_MS = 1000 / 30;

/** Hex color tokens from globals.css, in the order the shader expects them. */
const COLOR_TOKENS = ['--bg', '--glow-a', '--glow-b', '--glow-energy', '--aurora-a', '--aurora-b'] as const;
/** Numeric tokens, stored after the colors. */
const SCALAR_TOKENS = ['--aurora-intensity', '--ambient-fade', '--pointer-strength', '--pointer-radius'] as const;
/** Element whose bottom edge ends the ambient layers. Without one, they end after the first screen. */
const AMBIENT_END_SELECTOR = '[data-ambient-end]';
const PALETTE_SIZE = COLOR_TOKENS.length * 3 + SCALAR_TOKENS.length;

const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#define MAX_POINTS ${MAX_POINTS}
#define LIFETIME ${LIFETIME_S.toFixed(2)}

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBase;
uniform vec3 uGlowA;
uniform vec3 uGlowB;
uniform vec3 uGlowEnergy;
uniform vec3 uAuroraA;
uniform vec3 uAuroraB;
uniform float uAuroraIntensity;
uniform float uPointerStrength;
uniform float uPointerRadius;
// Page scroll, viewport height and the page range over which ambient layers fade out, all in CSS pixels.
uniform float uScroll;
uniform float uViewportHeight;
uniform float uFadeStart;
uniform float uFadeEnd;
// xy: position in viewport heights, zw: velocity in viewport heights per second.
uniform vec4 uPoints[MAX_POINTS];
uniform float uAges[MAX_POINTS];

varying vec2 vUv;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = rotate * p;
    amplitude *= 0.5;
  }
  return value;
}

// Northern lights: a few slow curtains with a wavy upper edge, a long soft fade below and faint vertical rays.
// Returns the blended curtain color in rgb and how much of the pixel it covers in a, so it can be
// mixed over both dark and light backgrounds.
vec4 aurora(vec2 p, float time) {
  vec3 tint = vec3(0.0);
  float coverage = 0.0;
  for (int i = 0; i < 3; i++) {
    float layer = float(i);
    float drift = time * (0.012 + layer * 0.006);
    float edge = 0.58 + layer * 0.1 + 0.2 * fbm(vec2(p.x * 0.55 + drift + layer * 7.3, time * 0.02 + layer * 3.1));
    float dy = p.y - edge;
    float curtain = dy > 0.0 ? exp(-dy * dy / 0.003) : exp(-dy * dy / (0.05 + layer * 0.03));
    float rays = 0.6 + 0.4 * noise(vec2(p.x * (7.0 + layer * 3.0) - drift * 4.0 + layer * 11.0, p.y * 0.6 + time * 0.03));
    float breathe = 0.65 + 0.35 * sin(time * (0.18 + layer * 0.05) + p.x * 1.3 + layer * 2.0);
    float amount = curtain * rays * breathe * (0.55 - layer * 0.12);
    tint += mix(uAuroraA, uAuroraB, 0.5 + 0.5 * sin(p.x * 1.1 + drift * 3.0 + layer)) * amount;
    coverage += amount;
  }
  return vec4(tint / max(coverage, 0.0001), coverage);
}

void main() {
  vec2 p = vec2(vUv.x * uRes.x / uRes.y, vUv.y);

  // Each recent pointer sample pushes the field along its velocity and swirls it around its path.
  vec2 displacement = vec2(0.0);
  float energy = 0.0;
  for (int i = 0; i < MAX_POINTS; i++) {
    float age = uAges[i];
    if (age < 0.0 || age > LIFETIME) continue;
    vec2 d = p - uPoints[i].xy;
    vec2 v = uPoints[i].zw;
    float fade = 1.0 - age / LIFETIME;
    // uPointerRadius sets the size of the disturbance around the pointer.
    float falloff = exp(-dot(d, d) / uPointerRadius) * fade * fade;
    float swirl = v.x * d.y - v.y * d.x;
    displacement += (v * falloff * 0.06 + vec2(-d.y, d.x) * swirl * falloff * 2.2) * uPointerStrength;
    energy += length(v) * falloff * uPointerStrength;
  }

  vec2 q = p - displacement;
  float t = uTime * 0.035;
  vec2 warp = vec2(
    fbm(q * 1.3 + vec2(t, -t * 0.7)),
    fbm(q * 1.3 + vec2(5.2 - t * 0.6, 1.3 + t))
  );
  float field = fbm(q * 1.1 + warp * 1.8 + vec2(-t * 0.5, t * 0.3));

  // Ambient layers belong to the top of the page and fade out past the hero.
  float pageY = uScroll + (1.0 - vUv.y) * uViewportHeight;
  float ambient = 1.0 - smoothstep(uFadeStart, uFadeEnd, pageY);
  // The pointer still reveals and stirs the gradient around itself further down the page.
  float reveal = max(ambient, clamp(energy * 0.6, 0.0, 1.0));

  vec3 color = uBase;
  color = mix(color, uGlowA, smoothstep(-0.05, 0.45, field) * 0.6 * reveal);
  color = mix(color, uGlowB, smoothstep(0.0, 0.5, warp.y) * 0.4 * reveal);
  color = mix(color, uGlowEnergy, clamp(energy * 0.1, 0.0, 0.45));
  vec4 lights = aurora(q, uTime);
  color = mix(color, lights.rgb, clamp(lights.a * 0.35 * uAuroraIntensity * ambient, 0.0, 0.6));

  // Dither so the smooth gradient does not band.
  color += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

function parseHex(value: string): number[] | null {
  const hex = value.trim().replace(/^#/, '');
  const full = hex.length === 3 ? [...hex].map((char) => char + char).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16) / 255);
}

/** Reads the palette tokens: RGB triples, then scalars. Invalid or missing tokens keep their previous value. */
function readPalette(previous: Float32Array): Float32Array {
  const styles = getComputedStyle(document.documentElement);
  const palette = new Float32Array(previous);
  COLOR_TOKENS.forEach((token, index) => {
    const rgb = parseHex(styles.getPropertyValue(token));
    if (rgb) palette.set(rgb, index * 3);
  });
  SCALAR_TOKENS.forEach((token, index) => {
    const value = parseFloat(styles.getPropertyValue(token));
    if (Number.isFinite(value)) palette[COLOR_TOKENS.length * 3 + index] = value;
  });
  return palette;
}

/**
 * Animated gradient behind the whole site. Pointer movement disturbs the gradient in proportion
 * to its speed instead of drawing a trail, and a slow aurora drifts on its own. Colors come from
 * the --bg, --glow-* and --aurora-* tokens in
 * globals.css. Without WebGL the plain page color shows instead.
 */
export function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // A fresh canvas per mount. React can run this effect twice in development, and a context
    // lost during cleanup can never be used again.
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    const program = gl && createProgram(gl);
    if (!gl || !program) {
      canvas.remove();
      return;
    }
    gl.useProgram(program);

    // One triangle that covers the viewport.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      res: uniform('uRes'),
      time: uniform('uTime'),
      colors: ['uBase', 'uGlowA', 'uGlowB', 'uGlowEnergy', 'uAuroraA', 'uAuroraB'].map(uniform),
      auroraIntensity: uniform('uAuroraIntensity'),
      pointerStrength: uniform('uPointerStrength'),
      pointerRadius: uniform('uPointerRadius'),
      scroll: uniform('uScroll'),
      viewportHeight: uniform('uViewportHeight'),
      fadeStart: uniform('uFadeStart'),
      fadeEnd: uniform('uFadeEnd'),
      points: uniform('uPoints'),
      ages: uniform('uAges'),
    };

    const points = new Float32Array(MAX_POINTS * 4);
    const ages = new Float32Array(MAX_POINTS);
    const sampleTimes = new Float64Array(MAX_POINTS).fill(-Infinity);
    let nextSlot = 0;
    let lastSample: { x: number; y: number; time: number } | null = null;
    let smoothVx = 0;
    let smoothVy = 0;

    // Theme changes swap the palette at once; the page-wide cross-fade in src/lib/theme.ts smooths it.
    let palette = readPalette(new Float32Array(PALETTE_SIZE));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();

    let ambientEnd: Element | null = null;
    let lastEndLookup = -Infinity;
    /** Page range (CSS px) over which the ambient layers fade, centered on the bottom of the hero. */
    const fadeRange = (now: number) => {
      if (!ambientEnd?.isConnected && now - lastEndLookup > 1000) {
        ambientEnd = document.querySelector(AMBIENT_END_SELECTOR);
        lastEndLookup = now;
      }
      const length = palette[COLOR_TOKENS.length * 3 + 1] ?? 320;
      const end = ambientEnd?.isConnected
        ? ambientEnd.getBoundingClientRect().bottom + window.scrollY
        : window.innerHeight;
      return { start: end - length, end: end + length * 0.5 };
    };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      for (let i = 0; i < MAX_POINTS; i++) ages[i] = (now - (sampleTimes[i] ?? -Infinity)) / 1000;

      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, reduceMotion ? 0 : (now - start) / 1000);
      uniforms.colors.forEach((location, index) => gl.uniform3fv(location, palette.subarray(index * 3, index * 3 + 3)));
      gl.uniform1f(uniforms.auroraIntensity, palette[COLOR_TOKENS.length * 3] ?? 0);
      gl.uniform1f(uniforms.pointerStrength, palette[COLOR_TOKENS.length * 3 + 2] ?? 1);
      // A zero radius would divide by zero in the shader.
      gl.uniform1f(uniforms.pointerRadius, Math.max(palette[COLOR_TOKENS.length * 3 + 3] ?? 0.012, 0.001));
      const fade = fadeRange(now);
      gl.uniform1f(uniforms.scroll, window.scrollY);
      gl.uniform1f(uniforms.viewportHeight, window.innerHeight);
      gl.uniform1f(uniforms.fadeStart, fade.start);
      gl.uniform1f(uniforms.fadeEnd, fade.end);
      gl.uniform4fv(uniforms.points, points);
      gl.uniform1fv(uniforms.ages, ages);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      const x = event.clientX / window.innerHeight;
      const y = 1 - event.clientY / window.innerHeight;
      const previous = lastSample;

      if (previous && now - previous.time < SAMPLE_INTERVAL_MS) return;
      lastSample = { x, y, time: now };
      // After a pause the distance travelled says nothing about speed.
      if (!previous || now - previous.time > 200) {
        smoothVx = 0;
        smoothVy = 0;
        return;
      }

      const seconds = (now - previous.time) / 1000;
      let vx = (x - previous.x) / seconds;
      let vy = (y - previous.y) / seconds;
      const speed = Math.hypot(vx, vy);
      if (speed > MAX_SPEED) {
        vx *= MAX_SPEED / speed;
        vy *= MAX_SPEED / speed;
      }

      // Ease toward the new velocity so quick, jittery movement does not flicker the gradient.
      smoothVx += (vx - smoothVx) * VELOCITY_SMOOTHING;
      smoothVy += (vy - smoothVy) * VELOCITY_SMOOTHING;

      points.set([x, y, smoothVx, smoothVy], nextSlot * 4);
      sampleTimes[nextSlot] = now;
      nextSlot = (nextSlot + 1) % MAX_POINTS;
    };

    const onResize = () => {
      resize();
      if (reduceMotion) draw(performance.now());
    };

    const themeObserver = new MutationObserver(() => {
      palette = readPalette(palette);
      // Draw right away so the new theme's snapshot already has the new colors.
      draw(performance.now());
    });

    let frame = 0;
    let lastDraw = 0;
    let lastScroll = -Infinity;
    const onScroll = () => {
      lastScroll = performance.now();
      if (reduceMotion) draw(lastScroll);
    };
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const newestSample = sampleTimes[(nextSlot + MAX_POINTS - 1) % MAX_POINTS] ?? -Infinity;
      const disturbed = now - newestSample < LIFETIME_S * 1000;
      // Full frame rate while the pointer stirs things up or the page scrolls, half otherwise.
      const scrolling = now - lastScroll < 300;
      if (disturbed || scrolling || now - lastDraw >= IDLE_FRAME_MS) {
        lastDraw = now;
        draw(now);
      }
    };

    const onContextLost = () => cancelAnimationFrame(frame);

    resize();
    draw(start);
    if (!reduceMotion) {
      frame = requestAnimationFrame(tick);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      themeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
