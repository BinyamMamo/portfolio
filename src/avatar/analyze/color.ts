// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/analyze/color.ts), which draws this avatar without Pixi. */
import type { Lab } from './types';

const toLinear = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const toSrgb = (v: number): number => {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, c)) * 255);
};

// D65 white, CIE constants
const XN = 0.95047;
const ZN = 1.08883;
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

const f = (t: number): number => (t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116);
const fInv = (t: number): number => (t ** 3 > EPSILON ? t ** 3 : (116 * t - 16) / KAPPA);

/** sRGB 0–255 → CIELAB (D65). */
function rgbToLab(r: number, g: number, b: number, out: Lab = { L: 0, a: 0, b: 0 }): Lab {
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / XN;
  const y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / ZN;
  const fy = f(y);
  out.L = 116 * fy - 16;
  out.a = 500 * (f(x) - fy);
  out.b = 200 * (fy - f(z));
  return out;
}

export function labToRgb(lab: Lab): [number, number, number] {
  const fy = (lab.L + 16) / 116;
  const x = fInv(fy + lab.a / 500) * XN;
  const y = lab.L > KAPPA * EPSILON ? fy ** 3 : lab.L / KAPPA;
  const z = fInv(fy - lab.b / 200) * ZN;
  return [
    toSrgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
    toSrgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z),
    toSrgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
  ];
}

export const labToHex = (lab: Lab): string => `#${labToRgb(lab).map((v) => v.toString(16).padStart(2, '0')).join('')}`;
export function hexToLab(hex: string): Lab {
  const n = parseInt(hex.replace('#', ''), 16);
  return rgbToLab((n >> 16) & 255, (n >> 8) & 255, n & 255);
}
