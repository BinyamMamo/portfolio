// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/verlet.ts), which draws this avatar without Pixi. */
/**
 * Position-based Verlet solver: particles + distance constraints, stored in typed arrays.
 *
 * One `step()` is one fixed tick. With the default settings (gravity [0, 0.003], damping 1,
 * one iteration, stiffness 1) it reproduces the 2022 `physics.js` arithmetic exactly, operation
 * for operation, so the classic avatar moves identically (see tests/unit/verlet-parity.test.ts).
 * Units are avatar space: the visible box spans [-1, 1].
 */

export interface WorldOptions {
  gravity?: readonly [number, number];
  /** Velocity retention per step, 1 = no damping. */
  damping?: number;
  /** Constraint relaxation passes per step. */
  iterations?: number;
}

export interface ParticleOptions {
  pinned?: boolean;
  /** Gravity multiplier for this particle. */
  gravity?: number;
}

const MAX_FLICK = 0.06;

export class VerletWorld {
  gravityX: number;
  gravityY: number;
  damping: number;
  iterations: number;

  count = 0;
  /** Current positions. */
  px = new Float64Array(64);
  py = new Float64Array(64);
  /** Positions at the start of the last step (Verlet "old location"). */
  ox = new Float64Array(64);
  oy = new Float64Array(64);
  /** Render positions, interpolated between the last two steps. */
  rx = new Float64Array(64);
  ry = new Float64Array(64);
  gravityScale = new Float64Array(64);
  pinned = new Uint8Array(64);

  constraintCount = 0;
  ca = new Int32Array(64);
  cb = new Int32Array(64);
  rest = new Float64Array(64);
  stiffness = new Float64Array(64);

  /** Particle currently held by the pointer, or -1. */
  grabbed = -1;
  private grabX = 0;
  private grabY = 0;

  constructor(options: WorldOptions = {}) {
    this.gravityX = options.gravity?.[0] ?? 0;
    this.gravityY = options.gravity?.[1] ?? 0.003;
    this.damping = options.damping ?? 1;
    this.iterations = options.iterations ?? 1;
  }

  addParticle(x: number, y: number, options: ParticleOptions = {}): number {
    if (this.count === this.px.length) this.growParticles();
    const i = this.count++;
    this.px[i] = this.ox[i] = this.rx[i] = x;
    this.py[i] = this.oy[i] = this.ry[i] = y;
    this.gravityScale[i] = options.gravity ?? 1;
    this.pinned[i] = options.pinned ? 1 : 0;
    return i;
  }

  /** Links two particles at their current distance (or `length`). `stiffness` in (0, 1]. */
  addConstraint(a: number, b: number, stiffness = 1, length?: number): number {
    if (this.constraintCount === this.ca.length) this.growConstraints();
    const c = this.constraintCount++;
    this.ca[c] = a;
    this.cb[c] = b;
    this.stiffness[c] = stiffness;
    if (length === undefined) {
      const dx = this.px[a] - this.px[b];
      const dy = this.py[a] - this.py[b];
      this.rest[c] = Math.sqrt(dx * dx + dy * dy);
    } else {
      this.rest[c] = length;
    }
    return c;
  }

  /** Moves a pinned particle (an anchor) for the coming step. */
  pin(i: number, x: number, y: number): void {
    this.ox[i] = this.px[i];
    this.oy[i] = this.py[i];
    this.px[i] = x;
    this.py[i] = y;
  }

  step(): void {
    const { px, py, ox, oy, gravityScale, pinned, damping, gravityX, gravityY, grabbed } = this;

    for (let i = 0; i < this.count; i++) {
      if (i === grabbed) {
        ox[i] = px[i];
        oy[i] = py[i];
        px[i] = this.grabX;
        py[i] = this.grabY;
        continue;
      }
      if (pinned[i]) continue;
      const x = px[i];
      const y = py[i];
      // Same operation order as physics.js: (location + velocity) + gravity * multiplier.
      const vx = damping === 1 ? x - ox[i] : (x - ox[i]) * damping;
      const vy = damping === 1 ? y - oy[i] : (y - oy[i]) * damping;
      ox[i] = x;
      oy[i] = y;
      px[i] = x + vx + gravityX * gravityScale[i];
      py[i] = y + vy + gravityY * gravityScale[i];
    }

    for (let pass = 0; pass < this.iterations; pass++) {
      for (let c = 0; c < this.constraintCount; c++) this.solve(c);
    }
  }

  private solve(c: number): void {
    const a = this.ca[c];
    const b = this.cb[c];
    const { px, py } = this;
    const aFixed = this.pinned[a] === 1 || a === this.grabbed;
    const bFixed = this.pinned[b] === 1 || b === this.grabbed;
    if (aFixed && bFixed) return;

    const dx = px[a] - px[b];
    const dy = py[a] - py[b];
    const magn = Math.sqrt(dx * dx + dy * dy);
    if (magn === 0) return;
    const inv = 1 / magn;
    const nx = dx * inv;
    const ny = dy * inv;
    const s = this.stiffness[c];
    const diff = s === 1 ? magn - this.rest[c] : (magn - this.rest[c]) * s;

    if (!aFixed && !bFixed) {
      const ka = -diff / 2;
      const kb = +diff / 2;
      px[a] = px[a] + nx * ka;
      py[a] = py[a] + ny * ka;
      px[b] = px[b] + nx * kb;
      py[b] = py[b] + ny * kb;
    } else if (!aFixed) {
      const ka = -diff;
      px[a] = px[a] + nx * ka;
      py[a] = py[a] + ny * ka;
    } else {
      px[b] = px[b] + nx * diff;
      py[b] = py[b] + ny * diff;
    }
  }

  /** Fills rx/ry with positions `alpha` of the way from the previous step to the current one. */
  interpolate(alpha: number): void {
    for (let i = 0; i < this.count; i++) {
      this.rx[i] = this.ox[i] + (this.px[i] - this.ox[i]) * alpha;
      this.ry[i] = this.oy[i] + (this.py[i] - this.oy[i]) * alpha;
    }
  }

  /** Nearest free particle to (x, y) within `radius`, or -1. */
  nearest(x: number, y: number, radius: number): number {
    let best = -1;
    let bestD = radius * radius;
    for (let i = 0; i < this.count; i++) {
      if (this.pinned[i]) continue;
      const dx = this.rx[i] - x;
      const dy = this.ry[i] - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  grab(i: number, x: number, y: number): void {
    this.grabbed = i;
    this.grabX = x;
    this.grabY = y;
  }

  drag(x: number, y: number): void {
    this.grabX = x;
    this.grabY = y;
  }

  /** Lets go, keeping the last pointer velocity (clamped) so the strand can be flicked. */
  release(): void {
    const i = this.grabbed;
    if (i < 0) return;
    this.grabbed = -1;
    let vx = this.px[i] - this.ox[i];
    let vy = this.py[i] - this.oy[i];
    const len = Math.hypot(vx, vy);
    if (len > MAX_FLICK) {
      vx *= MAX_FLICK / len;
      vy *= MAX_FLICK / len;
    }
    this.ox[i] = this.px[i] - vx;
    this.oy[i] = this.py[i] - vy;
  }

  private growParticles(): void {
    const n = this.px.length * 2;
    this.px = grow(this.px, n);
    this.py = grow(this.py, n);
    this.ox = grow(this.ox, n);
    this.oy = grow(this.oy, n);
    this.rx = grow(this.rx, n);
    this.ry = grow(this.ry, n);
    this.gravityScale = grow(this.gravityScale, n);
    const pinned = new Uint8Array(n);
    pinned.set(this.pinned);
    this.pinned = pinned;
  }

  private growConstraints(): void {
    const n = this.ca.length * 2;
    const ca = new Int32Array(n);
    ca.set(this.ca);
    this.ca = ca;
    const cb = new Int32Array(n);
    cb.set(this.cb);
    this.cb = cb;
    this.rest = grow(this.rest, n);
    this.stiffness = grow(this.stiffness, n);
  }
}

function grow(src: Float64Array, n: number): Float64Array<ArrayBuffer> {
  const out = new Float64Array(n);
  out.set(src);
  return out;
}

/** A pinned root followed by free particles hanging below it, linked in order. */
export class Chain {
  readonly indices: number[] = [];

  constructor(
    readonly world: VerletWorld,
    root: { x: number; y: number },
    readonly length: number,
    segments: number,
    options: { gravity?: number; stiffness?: number; direction?: readonly [number, number] } = {},
  ) {
    const [dx, dy] = options.direction ?? [0, 1];
    this.indices.push(world.addParticle(root.x, root.y, { pinned: true }));
    for (let s = 1; s <= segments; s++) {
      // The default (straight down) keeps the 2022 arithmetic exactly: y + length * s / segments.
      const d = (length * s) / segments;
      const x = dx === 0 ? root.x : root.x + dx * d;
      const y = dy === 1 ? root.y + d : root.y + dy * d;
      this.indices.push(world.addParticle(x, y, { gravity: options.gravity }));
      world.addConstraint(this.indices[s - 1], this.indices[s], options.stiffness ?? 1);
    }
  }

  get size(): number {
    return this.indices.length;
  }

  pin(x: number, y: number): void {
    this.world.pin(this.indices[0], x, y);
  }

  /** Render x of the k-th particle (0 = root). */
  x(k: number): number {
    return this.world.rx[this.indices[k]];
  }

  y(k: number): number {
    return this.world.ry[this.indices[k]];
  }
}
