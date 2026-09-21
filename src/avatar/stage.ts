/**
 * Draws the persona into a 2D canvas and advances its physics, one frame at a time.
 * The drawing code is twin's; this file is the small loop around it.
 */
import { CanvasSurface } from './engine/canvas-surface';
import { hashString, mulberry32 } from './engine/math';
import { Pen } from './engine/pen';
import { neutralRig, type RigState } from './engine/rig';
import { Chain, VerletWorld } from './engine/verlet';
import { createPersonaAvatar } from './persona/avatar';
import type { Persona } from './persona/persona';

/** The avatar box spans -1..1 in avatar units; the pen works in `UNIT`-sized design units. */
const UNIT = 500;
const MAX_SUBSTEPS = 5;

export interface AvatarStage {
  rig: RigState;
  /** Advances physics and redraws. `dt` is in seconds. */
  render(dt: number): void;
}

export function createAvatarStage(canvas: HTMLCanvasElement, persona: Persona): AvatarStage | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const definition = createPersonaAvatar(persona);
  const world = new VerletWorld(definition.physics);
  const random = mulberry32(hashString(definition.id));
  const instance = definition.setup({
    world,
    chain: (root, length, segments, options) => new Chain(world, root, length, segments, options),
    random,
  });

  const surface = new CanvasSurface(ctx);
  const pen = new Pen(UNIT);
  const rig = neutralRig();
  const frame = { time: 0, dt: 0 };
  const stepTime = 1 / (definition.stepRate ?? 60);
  let accumulator = 0;

  return {
    rig,
    render(dt) {
      const clamped = Math.min(dt, 0.1);
      frame.dt = clamped;
      frame.time += clamped;

      accumulator += clamped;
      let steps = 0;
      while (accumulator >= stepTime && steps < MAX_SUBSTEPS) {
        instance.step?.(rig);
        world.step();
        accumulator -= stepTime;
        steps += 1;
      }
      if (steps === MAX_SUBSTEPS) accumulator = Math.min(accumulator, stepTime);
      world.interpolate(accumulator / stepTime);

      const { width, height } = canvas;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      // The head reads best a little above centre, with the shoulders running off the bottom.
      const scale = width / (2 * UNIT);
      ctx.setTransform(scale, 0, 0, scale, width / 2, height * 0.56);
      pen.begin(surface);
      instance.draw(pen, rig, frame);
      pen.end();
    },
  };
}
