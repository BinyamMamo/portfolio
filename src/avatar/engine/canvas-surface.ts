// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/canvas-surface.ts), which draws this avatar without Pixi. */
import { hex, type FillStyle, type StrokeStyle, type Surface } from './surface';

type Command = [string, ...number[]];

/**
 * Draws an avatar into a 2D canvas: no Pixi, no WebGL. Fills are held back one step so `cut()` can
 * redraw them with a hole (Canvas2D has no boolean subtract, but it does have the even-odd rule).
 */
export class CanvasSurface implements Surface {
  private path: Command[] = [];
  private pending: { path: Command[]; style: FillStyle } | null = null;

  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  clear(): void {
    this.flush();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  beginPath(): void {
    this.path = [];
  }

  moveTo(x: number, y: number): void {
    this.path.push(['M', x, y]);
  }

  lineTo(x: number, y: number): void {
    this.path.push(['L', x, y]);
  }

  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void {
    this.path.push(['Q', cx, cy, x, y]);
  }

  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void {
    this.path.push(['C', c1x, c1y, c2x, c2y, x, y]);
  }

  closePath(): void {
    this.path.push(['Z']);
  }

  fill(style: FillStyle): void {
    this.flush();
    this.pending = { path: this.path, style };
  }

  stroke(style: StrokeStyle): void {
    this.flush();
    this.trace(this.path);
    this.ctx.strokeStyle = hex(style.color);
    this.ctx.globalAlpha = style.alpha ?? 1;
    this.ctx.lineWidth = style.width;
    this.ctx.lineCap = style.cap ?? 'round';
    this.ctx.lineJoin = style.join ?? 'round';
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }

  cut(): void {
    if (this.pending) this.pending.path = [...this.pending.path, ...this.path];
  }

  /** Paints whatever fill is still held back (call at the end of a frame). */
  flush(): void {
    const pending = this.pending;
    this.pending = null;
    if (!pending) return;
    this.trace(pending.path);
    this.ctx.fillStyle = hex(pending.style.color);
    this.ctx.globalAlpha = pending.style.alpha ?? 1;
    this.ctx.fill('evenodd');
    this.ctx.globalAlpha = 1;
  }

  private trace(path: readonly Command[]): void {
    const ctx = this.ctx;
    ctx.beginPath();
    for (const [op, ...v] of path) {
      if (op === 'M') ctx.moveTo(v[0], v[1]);
      else if (op === 'L') ctx.lineTo(v[0], v[1]);
      else if (op === 'Q') ctx.quadraticCurveTo(v[0], v[1], v[2], v[3]);
      else if (op === 'C') ctx.bezierCurveTo(v[0], v[1], v[2], v[3], v[4], v[5]);
      else ctx.closePath();
    }
  }
}
