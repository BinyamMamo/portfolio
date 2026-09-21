// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/math.ts), which draws this avatar without Pixi. */
export const TAU = Math.PI * 2;

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Maps `v` from [inLo, inHi] to [outLo, outHi], clamped. */
export const remap = (v: number, inLo: number, inHi: number, outLo: number, outHi: number): number =>
  lerp(outLo, outHi, clamp((v - inLo) / (inHi - inLo), 0, 1));

export const smoothstep = (t: number): number => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Frame-rate independent exponential approach: move `current` toward `target` at `rate` per second. */
export const damp = (current: number, target: number, rate: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-rate * dt));

/** Small deterministic PRNG so every avatar instance can have its own stable randomness. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
