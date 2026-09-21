// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/pen.ts), which draws this avatar without Pixi. */
import type { Surface } from './surface';
import { TAU } from './math';

/**
 * A Canvas2D-flavoured drawing API over a `Surface` (Pixi graphics, a 2D context, or SVG).
 *
 * - Avatars draw in avatar space ([-1, 1] is the visible box, y down) exactly like the 2022 code.
 * - Points are transformed on the CPU (save/restore/translate/scale/rotate), so non-uniform
 *   squish never distorts stroke widths, and arcs stay correct under any transform.
 * - Everything is emitted in a 1000-unit design space (`unit` = 500) because Pixi tessellates
 *   curves by local size; tiny unit-space shapes would come out faceted.
 * - The active style mode can add ink outlines, remap fill colours and "boil" the lines.
 */

export type ColorInput = number | string;
export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'miter' | 'round' | 'bevel';

export interface FillOptions {
  alpha?: number;
  /** Set false to keep this shape out of ink outlines (e.g. shapes that close across the face). */
  ink?: boolean;
}

export interface StrokeOptions {
  color?: ColorInput;
  /** Width in avatar units, scaled by the current transform like canvas `lineWidth`. */
  width?: number;
  alpha?: number;
  cap?: LineCap;
  join?: LineJoin;
}

/** Rendering tweaks set by the style mode. Avatars can read it but normally ignore it. */
export interface PenStyle {
  /** Outline every fill with this colour/width (avatar units). */
  ink: { color: number; width: number; alpha: number } | null;
  /** Remaps fill colours (0xRRGGBB → 0xRRGGBB). */
  fill: ((color: number) => number) | null;
  /** Remaps explicit stroke colours. */
  stroke: ((color: number) => number) | null;
  /** Line boil amplitude in design units (0 = off). */
  jitter: number;
  /** Changes a few times per second to animate the boil. */
  jitterSeed: number;
}

export const plainStyle = (): PenStyle => ({ ink: null, fill: null, stroke: null, jitter: 0, jitterSeed: 0 });

const MOVE = 0;
const LINE = 1;
const QUAD = 2;
const CUBIC = 3;
const CLOSE = 4;

const colorCache = new Map<string, number>();

/** `#rgb`, `#rrggbb` or a number. Kept here so the pen needs no renderer to parse a colour. */
export function toColorNumber(c: ColorInput): number {
  if (typeof c === 'number') return c;
  let n = colorCache.get(c);
  if (n === undefined) {
    const hex = c.trim().replace(/^#/, '');
    const full = hex.length === 3 ? [...hex].map((d) => d + d).join('') : hex;
    n = Number.parseInt(full, 16);
    if (!Number.isFinite(n)) n = 0;
    colorCache.set(c, n);
  }
  return n;
}

export class Pen {
  style: PenStyle = plainStyle();
  /** Default stroke width in avatar units (canvas `lineWidth`). */
  lineWidth = 0.01;
  lineCap: LineCap = 'round';
  lineJoin: LineJoin = 'round';

  private g!: Surface;
  // Affine matrix [a b c d e f]: x' = a*x + c*y + e, y' = b*x + d*y + f.
  private a = 1;
  private b = 0;
  private c = 0;
  private d = 1;
  private e = 0;
  private f = 0;
  private stack: number[] = [];
  private path: number[] = [];
  private inkPending: number[] | null = null;
  private hasPoint = false;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;

  constructor(readonly unit = 500) {}

  /** Starts a frame: clears the graphics and resets transform and path. */
  begin(g: Surface): this {
    this.g = g;
    g.clear();
    this.stack.length = 0;
    this.a = this.unit;
    this.b = 0;
    this.c = 0;
    this.d = this.unit;
    this.e = 0;
    this.f = 0;
    this.lineWidth = 0.01;
    this.path.length = 0;
    this.hasPoint = false;
    this.inkPending = null;
    return this;
  }

  /** Ends a frame, flushing any pending ink outline. */
  end(): void {
    this.flushInk();
  }

  // ---- transform -------------------------------------------------------------------------

  save(): this {
    this.stack.push(this.a, this.b, this.c, this.d, this.e, this.f, this.lineWidth);
    return this;
  }

  restore(): this {
    if (this.stack.length === 0) return this;
    this.lineWidth = this.stack.pop()!;
    this.f = this.stack.pop()!;
    this.e = this.stack.pop()!;
    this.d = this.stack.pop()!;
    this.c = this.stack.pop()!;
    this.b = this.stack.pop()!;
    this.a = this.stack.pop()!;
    return this;
  }

  translate(x: number, y: number): this {
    this.e += this.a * x + this.c * y;
    this.f += this.b * x + this.d * y;
    return this;
  }

  scale(sx: number, sy: number = sx): this {
    this.a *= sx;
    this.b *= sx;
    this.c *= sy;
    this.d *= sy;
    return this;
  }

  rotate(angle: number): this {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const { a, b, c, d } = this;
    this.a = a * cos + c * sin;
    this.b = b * cos + d * sin;
    this.c = c * cos - a * sin;
    this.d = d * cos - b * sin;
    return this;
  }

  /** Draws `draw(1)` then mirrors horizontally and draws `draw(-1)`, the 2022 half-then-flip trick. */
  mirror(draw: (side: 1 | -1) => void): this {
    this.save();
    draw(1);
    this.scale(-1, 1);
    draw(-1);
    this.restore();
    return this;
  }

  // ---- path ------------------------------------------------------------------------------

  beginPath(): this {
    this.path.length = 0;
    this.hasPoint = false;
    return this;
  }

  moveTo(x: number, y: number): this {
    const [tx, ty] = this.tx(x, y);
    this.path.push(MOVE, tx, ty);
    this.hasPoint = true;
    this.startX = this.lastX = tx;
    this.startY = this.lastY = ty;
    return this;
  }

  lineTo(x: number, y: number): this {
    if (!this.hasPoint) return this.moveTo(x, y);
    const [tx, ty] = this.tx(x, y);
    this.path.push(LINE, tx, ty);
    this.lastX = tx;
    this.lastY = ty;
    return this;
  }

  quadraticCurveTo(cx: number, cy: number, x: number, y: number): this {
    if (!this.hasPoint) this.moveTo(cx, cy);
    const [tcx, tcy] = this.tx(cx, cy);
    const [tx, ty] = this.tx(x, y);
    this.path.push(QUAD, tcx, tcy, tx, ty);
    this.lastX = tx;
    this.lastY = ty;
    return this;
  }

  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this {
    if (!this.hasPoint) this.moveTo(c1x, c1y);
    const [t1x, t1y] = this.tx(c1x, c1y);
    const [t2x, t2y] = this.tx(c2x, c2y);
    const [tx, ty] = this.tx(x, y);
    this.path.push(CUBIC, t1x, t1y, t2x, t2y, tx, ty);
    this.lastX = tx;
    this.lastY = ty;
    return this;
  }

  /** Canvas `arc`: connects from the current point, sweeps clockwise unless `ccw`. */
  arc(x: number, y: number, r: number, start: number, end: number, ccw = false): this {
    let sweep = end - start;
    if (!ccw) {
      if (sweep >= TAU) sweep = TAU;
      else {
        sweep %= TAU;
        if (sweep < 0) sweep += TAU;
      }
    } else if (-sweep >= TAU) sweep = -TAU;
    else {
      sweep %= TAU;
      if (sweep > 0) sweep -= TAU;
    }

    const sx = x + Math.cos(start) * r;
    const sy = y + Math.sin(start) * r;
    if (this.hasPoint) this.lineTo(sx, sy);
    else this.moveTo(sx, sy);

    const pieces = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2) - 1e-9));
    const step = sweep / pieces;
    const k = (4 / 3) * Math.tan(step / 4);
    let a0 = start;
    for (let i = 0; i < pieces; i++) {
      const a1 = a0 + step;
      const cos0 = Math.cos(a0);
      const sin0 = Math.sin(a0);
      const cos1 = Math.cos(a1);
      const sin1 = Math.sin(a1);
      this.bezierCurveTo(
        x + r * (cos0 - k * sin0),
        y + r * (sin0 + k * cos0),
        x + r * (cos1 + k * sin1),
        y + r * (sin1 - k * cos1),
        x + r * cos1,
        y + r * sin1,
      );
      a0 = a1;
    }
    return this;
  }

  /** Closed circle as its own subpath. */
  circle(x: number, y: number, r: number): this {
    this.hasPoint = false;
    this.arc(x, y, r, 0, TAU);
    return this.closePath();
  }

  /** Closed ellipse as its own subpath. */
  ellipse(x: number, y: number, rx: number, ry: number, rotation = 0): this {
    this.save().translate(x, y).rotate(rotation).scale(rx, ry);
    this.circle(0, 0, 1);
    return this.restore();
  }

  closePath(): this {
    if (!this.hasPoint) return this;
    this.path.push(CLOSE);
    this.lastX = this.startX;
    this.lastY = this.startY;
    return this;
  }

  /** Smooth open curve through points using midpoint quadratics (good for chains/strands). */
  smoothThrough(xs: ArrayLike<number>, ys: ArrayLike<number>, count = xs.length): this {
    if (count < 2) return this;
    this.moveTo(xs[0], ys[0]);
    for (let i = 1; i < count - 1; i++) {
      this.quadraticCurveTo(xs[i], ys[i], (xs[i] + xs[i + 1]) / 2, (ys[i] + ys[i + 1]) / 2);
    }
    return this.lineTo(xs[count - 1], ys[count - 1]);
  }

  // ---- paint -----------------------------------------------------------------------------

  fill(color: ColorInput, options: FillOptions = {}): this {
    this.flushInk();
    if (this.path.length === 0) return this;
    let n = toColorNumber(color);
    if (this.style.fill) n = this.style.fill(n);
    this.replay(this.path);
    this.g.fill({ color: n, alpha: options.alpha ?? 1 });
    if (this.style.ink && options.ink !== false) this.inkPending = this.path.slice();
    return this;
  }

  stroke(options: StrokeOptions = {}): this {
    this.flushInk();
    if (this.path.length === 0) return this;
    let n = toColorNumber(options.color ?? 0x000000);
    if (this.style.stroke) n = this.style.stroke(n);
    this.replay(this.path);
    this.g.stroke({
      color: n,
      alpha: options.alpha ?? 1,
      width: this.designWidth(options.width ?? this.lineWidth),
      cap: options.cap ?? this.lineCap,
      join: options.join ?? this.lineJoin,
    });
    return this;
  }

  /** Cuts the current path out of the previous fill (call right after `fill`). */
  cut(): this {
    if (this.path.length === 0) return this;
    this.replay(this.path);
    this.g.cut();
    this.inkPending?.push(...this.path);
    return this;
  }

  private flushInk(): void {
    const pending = this.inkPending;
    const ink = this.style.ink;
    this.inkPending = null;
    if (!pending || !ink) return;
    this.replay(pending);
    this.g.stroke({ color: ink.color, alpha: ink.alpha, width: ink.width * this.unit, cap: 'round', join: 'round' });
  }

  private replay(cmds: number[]): void {
    const g = this.g;
    g.beginPath();
    for (let i = 0; i < cmds.length; ) {
      switch (cmds[i]) {
        case MOVE:
          g.moveTo(cmds[i + 1], cmds[i + 2]);
          i += 3;
          break;
        case LINE:
          g.lineTo(cmds[i + 1], cmds[i + 2]);
          i += 3;
          break;
        case QUAD:
          g.quadraticCurveTo(cmds[i + 1], cmds[i + 2], cmds[i + 3], cmds[i + 4]);
          i += 5;
          break;
        case CUBIC:
          g.bezierCurveTo(cmds[i + 1], cmds[i + 2], cmds[i + 3], cmds[i + 4], cmds[i + 5], cmds[i + 6]);
          i += 7;
          break;
        default:
          g.closePath();
          i += 1;
      }
    }
  }

  private designWidth(w: number): number {
    return w * Math.sqrt(Math.abs(this.a * this.d - this.b * this.c));
  }

  private readonly out: [number, number] = [0, 0];

  private tx(x: number, y: number): [number, number] {
    let px = this.a * x + this.c * y + this.e;
    let py = this.b * x + this.d * y + this.f;
    const j = this.style.jitter;
    if (j > 0) {
      const s = this.style.jitterSeed;
      px += Math.sin(py * 0.037 + s * 1.7) * Math.cos(px * 0.023 + s * 2.3) * j;
      py += Math.sin(px * 0.031 + s * 2.9) * Math.cos(py * 0.027 + s * 1.1) * j;
    }
    this.out[0] = px;
    this.out[1] = py;
    return this.out;
  }

  /** Current point in design units (for debugging overlays). */
  get cursor(): { x: number; y: number } {
    return { x: this.lastX, y: this.lastY };
  }
}
