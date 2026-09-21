// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/brush.ts), which draws this avatar without Pixi. */
import { lerp } from './math';
import type { ColorInput, Pen } from './pen';
import type { Chain } from './verlet';

const MAX_POINTS = 128;
const xs = new Float64Array(MAX_POINTS);
const ys = new Float64Array(MAX_POINTS);
const rightX = new Float64Array(MAX_POINTS);
const rightY = new Float64Array(MAX_POINTS);

/**
 * Tapered filled ribbon along a chain (hair locks, tails, scarves). Width eases from
 * `rootWidth` to `tipWidth` (avatar units) and the tip is rounded.
 */
export function strand(pen: Pen, chain: Chain, color: ColorInput, rootWidth: number, tipWidth: number): void {
  const n = Math.min(chain.size, MAX_POINTS / 2 - 1);
  if (n < 2) return;

  let m = 0;
  let tx = 0;
  let ty = 0;
  for (let k = 0; k < n; k++) {
    const a = Math.max(0, k - 1);
    const b = Math.min(n - 1, k + 1);
    tx = chain.x(b) - chain.x(a);
    ty = chain.y(b) - chain.y(a);
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    const half = lerp(rootWidth, tipWidth, k / (n - 1)) / 2;
    xs[m] = chain.x(k) - ty * half;
    ys[m] = chain.y(k) + tx * half;
    rightX[k] = chain.x(k) + ty * half;
    rightY[k] = chain.y(k) - tx * half;
    m++;
  }
  // rounded tip
  xs[m] = chain.x(n - 1) + tx * tipWidth * 0.9;
  ys[m] = chain.y(n - 1) + ty * tipWidth * 0.9;
  m++;
  for (let k = n - 1; k >= 0; k--) {
    xs[m] = rightX[k];
    ys[m] = rightY[k];
    m++;
  }

  pen.beginPath();
  smoothClosed(pen, xs, ys, m).fill(color);
}

/** Adds a smooth closed subpath through points (midpoint quadratics), e.g. a soft-body outline. */
export function smoothClosed(pen: Pen, px: ArrayLike<number>, py: ArrayLike<number>, count = px.length): Pen {
  if (count < 3) return pen;
  pen.moveTo((px[count - 1] + px[0]) / 2, (py[count - 1] + py[0]) / 2);
  for (let i = 0; i < count; i++) {
    const j = (i + 1) % count;
    pen.quadraticCurveTo(px[i], py[i], (px[i] + px[j]) / 2, (py[i] + py[j]) / 2);
  }
  return pen.closePath();
}
