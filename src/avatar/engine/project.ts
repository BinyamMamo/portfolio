// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/project.ts), which draws this avatar without Pixi. */
/**
 * Optional 2.5D helper: place face features on an imaginary head surface with depth `z`
 * (+ toward the viewer) and rotate by yaw/pitch, giving consistent parallax across features.
 * The classic avatar does not use it (it keeps its hand-tuned squish); new avatars can.
 */

export interface Projected {
  x: number;
  y: number;
  /** Depth after rotation, + toward the viewer. Useful for hiding features turning away. */
  z: number;
}

/**
 * @param yaw   radians, + turns toward screen right
 * @param pitch radians, + looks down
 */
export function project(x: number, y: number, z: number, yaw: number, pitch: number, out: Projected): Projected {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  out.x = x1;
  out.y = y * cp + z1 * sp;
  out.z = -y * sp + z1 * cp;
  return out;
}

/** Depth of a point on a sphere of radius `r` centred at the origin (0 outside it). */
export const sphereZ = (x: number, y: number, r: number): number => Math.sqrt(Math.max(0, r * r - x * x - y * y));

export const projected = (): Projected => ({ x: 0, y: 0, z: 0 });
