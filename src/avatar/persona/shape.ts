// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/persona/shape.ts), which draws this avatar without Pixi. */
import { FACE_OVAL, LEFT_BROW, LEFT_EYE, LIPS_INNER, LIPS_OUTER, RIGHT_BROW, RIGHT_EYE } from '../analyze/landmarks';

/** Nose points, bridge to tip to nostrils. */
export const NOSE = [168, 6, 197, 195, 5, 4, 1, 2, 98, 327, 129, 358];

/** Every landmark the cartoon is drawn from. */
export const SHAPE_POINTS = [...new Set([...FACE_OVAL, ...RIGHT_EYE, ...LEFT_EYE, ...RIGHT_BROW, ...LEFT_BROW, ...LIPS_OUTER, ...LIPS_INNER, ...NOSE])];

/** All face mesh landmarks (without the iris points): the detail layer is mapped on every one. */
export const FACE_POINTS = Array.from({ length: 468 }, (_, i) => i);

/** x, y, z in inter-eye units: origin at the eye midpoint, eyes level, +y down, -z toward the viewer. */
export type ShapePoint = [number, number, number];

export interface FaceShape {
  points: Record<number, ShapePoint>;
  /** Iris radius in inter-eye units (eyes share it). */
  irisRadius: number;
}

export interface FaceFrame {
  /** Image pixels → normalized face coordinates. */
  toFace(x: number, y: number): Point;
  /** Normalized face coordinates → image pixels. */
  toImage(x: number, y: number): Point;
  /** Image pixels per inter-eye unit. */
  scale: number;
}

/** The similarity transform that puts the eyes level, their midpoint at the origin, one apart. */
