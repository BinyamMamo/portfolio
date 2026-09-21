// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/surface.ts), which draws this avatar without Pixi. */
/**
 * What the pen draws onto. Pixi's `Graphics` already matches this, and the Canvas2D and SVG
 * backends let an avatar be drawn (or exported) without Pixi at all.
 */
export interface FillStyle {
  color: number;
  alpha?: number;
}

export interface StrokeStyle extends FillStyle {
  width: number;
  cap?: 'butt' | 'round' | 'square';
  join?: 'miter' | 'round' | 'bevel';
}

export interface Surface {
  clear(): unknown;
  beginPath(): unknown;
  moveTo(x: number, y: number): unknown;
  lineTo(x: number, y: number): unknown;
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): unknown;
  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): unknown;
  closePath(): unknown;
  fill(style: FillStyle): unknown;
  stroke(style: StrokeStyle): unknown;
  /** Cuts the current path out of the shape just filled. */
  cut(): unknown;
}

export const hex = (color: number): string => `#${(color >>> 0 & 0xffffff).toString(16).padStart(6, '0')}`;
