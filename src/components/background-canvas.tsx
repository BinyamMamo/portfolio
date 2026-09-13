'use client';

import { useEffect, useRef } from 'react';

/** Recent pointer samples kept for the disturbance. Must match MAX_POINTS in the shader. */
const MAX_POINTS = 24;
/** Seconds a pointer sample keeps disturbing the gradient. Must match LIFETIME in the shader. */
const LIFETIME_S = 1.6;
const SAMPLE_INTERVAL_MS = 20;
/** Pointer speed cap in viewport heights per second, so flicks do not tear the gradient apart. */
const MAX_SPEED = 6;
/** The gradient is soft, so rendering below native resolution is invisible and much cheaper. */
const RENDER_SCALE = 0.5;
const IDLE_FRAME_MS = 1000 / 30;

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
uniform float uDark;
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
    float falloff = exp(-dot(d, d) / 0.04) * fade * fade;
    float swirl = v.x * d.y - v.y * d.x;
    displacement += v * falloff * 0.11 + vec2(-d.y, d.x) * swirl * falloff * 3.0;
    energy += length(v) * falloff;
  }

  vec2 q = p - displacement;
  float t = uTime * 0.035;
  vec2 warp = vec2(
    fbm(q * 1.3 + vec2(t, -t * 0.7)),
    fbm(q * 1.3 + vec2(5.2 - t * 0.6, 1.3 + t))
  );
  float field = fbm(q * 1.1 + warp * 1.8 + vec2(-t * 0.5, t * 0.3));

  // Light tints stay close to white so the page never reads as grey.
  vec3 base = mix(vec3(0.98), vec3(0.039), uDark);
  vec3 colorA = mix(vec3(0.88, 0.97, 0.92), vec3(0.03, 0.26, 0.18), uDark);
  vec3 colorB = mix(vec3(0.90, 0.96, 0.97), vec3(0.04, 0.16, 0.21), uDark);

  vec3 color = base;
  color = mix(color, colorA, smoothstep(-0.05, 0.45, field) * 0.6);
  color = mix(color, colorB, smoothstep(0.0, 0.5, warp.y) * 0.4);
  color = mix(color, colorA, clamp(energy * 0.12, 0.0, 0.5));

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

/**
 * Animated gradient behind the whole site. Pointer movement disturbs the gradient in proportion
 * to its speed instead of drawing a trail. Falls back to the plain page color without WebGL.
 */
export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!canvas || !gl) return;

    const program = createProgram(gl);
    if (!program) return;
    gl.useProgram(program);

    // One triangle that covers the viewport.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      res: gl.getUniformLocation(program, 'uRes'),
      time: gl.getUniformLocation(program, 'uTime'),
      dark: gl.getUniformLocation(program, 'uDark'),
      points: gl.getUniformLocation(program, 'uPoints'),
      ages: gl.getUniformLocation(program, 'uAges'),
    };

    const points = new Float32Array(MAX_POINTS * 4);
    const ages = new Float32Array(MAX_POINTS);
    const sampleTimes = new Float64Array(MAX_POINTS).fill(-Infinity);
    let nextSlot = 0;
    let lastSample: { x: number; y: number; time: number } | null = null;

    const start = performance.now();
    const isDarkTheme = () => document.documentElement.classList.contains('dark');
    let dark = isDarkTheme() ? 1 : 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    let previousDraw = performance.now();
    const draw = (now: number) => {
      // Ease between themes over time, so slow devices finish the fade as quickly as fast ones.
      const seconds = Math.min((now - previousDraw) / 1000, 0.25);
      previousDraw = now;
      const target = isDarkTheme() ? 1 : 0;
      dark = reduceMotion ? target : dark + (target - dark) * (1 - Math.exp(-seconds * 10));
      if (Math.abs(target - dark) < 0.002) dark = target;

      for (let i = 0; i < MAX_POINTS; i++) ages[i] = (now - (sampleTimes[i] ?? -Infinity)) / 1000;

      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, reduceMotion ? 0 : (now - start) / 1000);
      gl.uniform1f(uniforms.dark, dark);
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
      if (!previous || now - previous.time > 200) return;

      const seconds = (now - previous.time) / 1000;
      let vx = (x - previous.x) / seconds;
      let vy = (y - previous.y) / seconds;
      const speed = Math.hypot(vx, vy);
      if (speed > MAX_SPEED) {
        vx *= MAX_SPEED / speed;
        vy *= MAX_SPEED / speed;
      }

      points.set([x, y, vx, vy], nextSlot * 4);
      sampleTimes[nextSlot] = now;
      nextSlot = (nextSlot + 1) % MAX_POINTS;
    };

    resize();
    draw(performance.now());

    if (reduceMotion) {
      // Static gradient: redraw only when the size or theme changes.
      const redraw = () => {
        resize();
        draw(performance.now());
      };
      const themeObserver = new MutationObserver(redraw);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener('resize', redraw);
      return () => {
        themeObserver.disconnect();
        window.removeEventListener('resize', redraw);
      };
    }

    let frame = 0;
    let lastDraw = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const newestSample = sampleTimes[(nextSlot + MAX_POINTS - 1) % MAX_POINTS] ?? -Infinity;
      const disturbed = now - newestSample < LIFETIME_S * 1000;
      const changingTheme = dark !== (isDarkTheme() ? 1 : 0);
      // Full frame rate while the pointer stirs things up or the theme fades, half otherwise.
      if (disturbed || changingTheme || now - lastDraw >= IDLE_FRAME_MS) {
        lastDraw = now;
        draw(now);
      }
    };
    frame = requestAnimationFrame(tick);

    const onContextLost = () => cancelAnimationFrame(frame);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', resize);
    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 size-full" />;
}
