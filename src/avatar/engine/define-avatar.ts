// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/define-avatar.ts), which draws this avatar without Pixi. */
import type { Pen } from './pen';
import type { RigState } from './rig';
import { Chain, type VerletWorld, type WorldOptions } from './verlet';

/** Soft radial light behind the avatar, per colour scheme (0xRRGGBB). */
export interface Backdrop {
  light: number;
  dark: number;
}

export interface FrameInfo {
  /** Seconds since the avatar was created. */
  time: number;
  dt: number;
}

export interface ChainOptions {
  gravity?: number;
  stiffness?: number;
  /** Unit vector the chain is laid out along at creation (default straight down). */
  direction?: readonly [number, number];
}

export interface AvatarKit {
  world: VerletWorld;
  /** A pinned root plus `segments` free particles hanging `length` below it. */
  chain(root: { x: number; y: number }, length: number, segments: number, options?: ChainOptions): Chain;
  /** Deterministic randomness, stable per avatar. */
  random: () => number;
}

export interface AvatarInstance {
  /** Fixed-rate tick before each physics step: move anchors (chain roots, pins) from the rig. */
  step?(rig: Readonly<RigState>): void;
  /** Every frame: draw in avatar space ([-1, 1] is the visible box, y down). */
  draw(pen: Pen, rig: Readonly<RigState>, frame: FrameInfo): void;
}

export interface AvatarDefinition {
  id: string;
  backdrop: Backdrop;
  physics?: WorldOptions;
  /** Physics ticks per second (default 60, which matches the 2022 per-frame tuning). */
  stepRate?: number;
  setup(kit: AvatarKit): AvatarInstance;
}

/** Identity helper that gives avatar modules full type inference. */
export const defineAvatar = (definition: AvatarDefinition): AvatarDefinition => definition;
