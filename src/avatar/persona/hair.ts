// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/persona/hair.ts), which draws this avatar without Pixi. */
import type { Point } from '../analyze/types';

export const HAIR_RAYS = 96;
const HAIRLINE_COLUMNS = 25;

export interface HairShape {
  /** Ray origin (face centre) in face coordinates. */
  centre: Point;
  /** Farthest hair along each ray, starting straight up and going clockwise; 0 = no hair. */
  radius: number[];
  /** Where hair meets forehead, left → right, in face coordinates (null = no hair in that column). */
  hairline: (Point | null)[];
  /** False for bald or shaved heads. */
  present: boolean;
}
