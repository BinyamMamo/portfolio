/**
 * Draws the persona into a 2D canvas and advances its physics, one frame at a time.
 * The drawing code is twin's. This file adds the loop around it, twin's ink look, and a Canvas2D
 * version of twin's detail layer: the photo's own lines and shadows, mapped onto the cartoon's posed
 * face so they follow every turn and blink.
 */
import { CanvasSurface } from './engine/canvas-surface';
import { hashString, mulberry32 } from './engine/math';
import { Pen } from './engine/pen';
import { neutralRig, type RigState } from './engine/rig';
import { Chain, VerletWorld } from './engine/verlet';
import { FACE_OVAL } from './analyze/landmarks';
import { createPersonaAvatar, type PersonaPose } from './persona/avatar';
import type { Persona } from './persona/persona';

/** The avatar box spans -1..1 in avatar units; the pen works in `UNIT`-sized design units. */
const UNIT = 500;
const MAX_SUBSTEPS = 5;
/** Where the avatar's origin sits, as a share of the canvas height. */
const ORIGIN_Y = 0.56;

/** twin's "ink" style: dark outlines and fills eased a little toward paper. */
const PAPER = 0xf6f1e7;
const INK = { color: 0x1c1917, width: 0.011, alpha: 1 };
function mixColor(a: number, b: number, t: number): number {
  const channel = (shift: number) => {
    const from = (a >> shift) & 255;
    return Math.round(from + (((b >> shift) & 255) - from) * t);
  };
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

export interface DetailMesh {
  /** Face landmark ids, one per vertex. */
  ids: number[];
  /** Triangles as vertex indices. */
  indices: number[];
  /** Texture coordinates, 0..1, two per vertex. */
  uvs: number[];
  /** Per eye, how much each vertex moves with that upper lid. */
  lidFields: number[][];
}

export interface AvatarStage {
  rig: RigState;
  /** Advances physics and redraws. `dt` is in seconds. */
  render(dt: number): void;
}

export function createAvatarStage(
  canvas: HTMLCanvasElement,
  persona: Persona,
  detail?: { image: CanvasImageSource & { width: number; height: number }; mesh: DetailMesh },
): AvatarStage | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const pose: PersonaPose = { posed: {}, lidDrop: [0, 0] };
  const definition = createPersonaAvatar(persona, pose);
  const world = new VerletWorld(definition.physics);
  const random = mulberry32(hashString(definition.id));
  const instance = definition.setup({
    world,
    chain: (root, length, segments, options) => new Chain(world, root, length, segments, options),
    random,
  });

  const surface = new CanvasSurface(ctx);
  const pen = new Pen(UNIT);
  pen.style.ink = INK;
  pen.style.fill = (color: number) => mixColor(color, PAPER, 0.16);
  const rig = neutralRig();
  const frame = { time: 0, dt: 0 };
  const stepTime = 1 / (definition.stepRate ?? 60);
  let accumulator = 0;

  const layer = document.createElement('canvas');
  const layerCtx = layer.getContext('2d');

  const drawDetail = () => {
    if (!detail || !layerCtx) return;
    const { image, mesh } = detail;
    const { width, height } = canvas;
    const scale = width / 2;
    if (layer.width !== width || layer.height !== height) {
      layer.width = width;
      layer.height = height;
    }
    const px = new Float32Array(mesh.ids.length * 2);
    mesh.ids.forEach((id, k) => {
      const point = pose.posed[id];
      if (!point) return;
      px[k * 2] = point[0];
      px[k * 2 + 1] = point[1] + (mesh.lidFields[0]?.[k] ?? 0) * pose.lidDrop[0] + (mesh.lidFields[1]?.[k] ?? 0) * pose.lidDrop[1];
    });

    // 1. Map every texture triangle onto its posed triangle, on the offscreen layer.
    layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    layerCtx.clearRect(0, 0, width, height);
    const tw = image.width;
    const th = image.height;
    // Triangles are grown by about a pixel so neighbours overlap and no gaps show.
    const grow = 0.9 / scale;
    for (let t = 0; t < mesh.indices.length; t += 3) {
      const i0 = mesh.indices[t]!;
      const i1 = mesh.indices[t + 1]!;
      const i2 = mesh.indices[t + 2]!;
      const x0 = px[i0 * 2]!, y0 = px[i0 * 2 + 1]!;
      const x1 = px[i1 * 2]!, y1 = px[i1 * 2 + 1]!;
      const x2 = px[i2 * 2]!, y2 = px[i2 * 2 + 1]!;
      const u0 = mesh.uvs[i0 * 2]! * tw, v0 = mesh.uvs[i0 * 2 + 1]! * th;
      const u1 = mesh.uvs[i1 * 2]! * tw, v1 = mesh.uvs[i1 * 2 + 1]! * th;
      const u2 = mesh.uvs[i2 * 2]! * tw, v2 = mesh.uvs[i2 * 2 + 1]! * th;

      // The affine map that takes the texture triangle onto the posed one.
      const det = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
      if (Math.abs(det) < 1e-9) continue;
      const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / det;
      const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / det;
      const c = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / det;
      const d = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / det;
      const e = x0 - a * u0 - c * v0;
      const f = y0 - b * u0 - d * v0;

      const cx = (x0 + x1 + x2) / 3;
      const cy = (y0 + y1 + y2) / 3;
      const out = (x: number, y: number) => {
        const len = Math.hypot(x - cx, y - cy) || 1;
        return [x + ((x - cx) / len) * grow, y + ((y - cy) / len) * grow] as const;
      };
      layerCtx.save();
      layerCtx.setTransform(scale, 0, 0, scale, width / 2, height * ORIGIN_Y);
      layerCtx.beginPath();
      layerCtx.moveTo(...out(x0, y0));
      layerCtx.lineTo(...out(x1, y1));
      layerCtx.lineTo(...out(x2, y2));
      layerCtx.closePath();
      layerCtx.clip();
      layerCtx.transform(a, b, c, d, e, f);
      layerCtx.drawImage(image, 0, 0);
      layerCtx.restore();
    }

    // 2. Multiply the layer over the cartoon once, inside the same smoothed outline it fills its face with.
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, width / 2, height * ORIGIN_Y);
    const at = (k: number) => pose.posed[FACE_OVAL[(k + FACE_OVAL.length) % FACE_OVAL.length]!] ?? [0, 0];
    const mid = (a: readonly number[], b: readonly number[]) => [((a[0] ?? 0) + (b[0] ?? 0)) / 2, ((a[1] ?? 0) + (b[1] ?? 0)) / 2] as const;
    ctx.beginPath();
    ctx.moveTo(...mid(at(-1), at(0)));
    for (let k = 0; k < FACE_OVAL.length; k += 1) {
      const p = at(k);
      ctx.quadraticCurveTo(p[0], p[1], ...mid(p, at(k + 1)));
    }
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  };

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
      const scale = width / (2 * UNIT);
      ctx.setTransform(scale, 0, 0, scale, width / 2, height * ORIGIN_Y);
      pen.begin(surface);
      instance.draw(pen, rig, frame);
      pen.end();
      drawDetail();
    },
  };
}
