// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/analyze/types.ts), which draws this avatar without Pixi. */
/** Share of the eye band labelled as accessories above which we assume glasses. */
export const GLASSES = 0.05;

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** RGBA pixels, like canvas ImageData, so analysis runs in node tests too. */
export interface ImageLike {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface DetectedFace {
  /** 478 × (x, y, z) in image pixels (z scaled like x). */
  landmarks: Float32Array;
  box: Box;
  /** Column-major 4×4 facial transformation matrix. */
  matrix: number[];
  blendshapes: Record<string, number>;
}

/** Classes of MediaPipe's multiclass selfie segmenter. */
export const SEGMENT = {
  background: 0,
  hair: 1,
  bodySkin: 2,
  faceSkin: 3,
  clothes: 4,
  others: 5,
} as const;

/** Category labels for a square crop of the image around the face. */
export interface SegmentMask {
  labels: Uint8Array;
  width: number;
  height: number;
  /** Crop square in image pixels. */
  x: number;
  y: number;
  side: number;
}

export interface Lab {
  L: number;
  a: number;
  b: number;
}

export interface ColorSample {
  hex: string;
  lab: Lab;
  /** Pixels that contributed. */
  count: number;
}

export interface Palette {
  skin: ColorSample | null;
  hair: ColorSample | null;
  brows: ColorSample | null;
  eyes: ColorSample | null;
  lips: ColorSample | null;
  clothes: ColorSample | null;
  /** Nearest Monk Skin Tone swatch, 1 (lightest) to 10, or 0 when unknown. */
  skinTone: number;
  /** RGB gains applied before measuring colours. */
  whiteBalance: [number, number, number];
  balancedFrom: 'sclera' | 'none';
}

/** Face proportions, normalised by inter-eye distance or by face width so they are scale and roll invariant. */
export interface FaceFeatures {
  faceWidth: number;
  faceAspect: number;
  jawWidth: number;
  chinWidth: number;
  eyeWidth: number;
  eyeOpen: number;
  eyeTilt: number;
  eyeSpacing: number;
  browHeight: number;
  browThickness: number;
  browArch: number;
  browTilt: number;
  noseWidth: number;
  noseLength: number;
  mouthWidth: number;
  upperLip: number;
  lowerLip: number;
  foreheadHeight: number;
}

export interface HairFeatures {
  /** Hair pixels relative to the face box area. */
  coverage: number;
  /** Hair height above the upper forehead, in face heights. */
  top: number;
  /** Lowest hair beside the face relative to the chin, in face heights (negative = above the chin). */
  length: number;
  /** Hair width at eye level, in face widths. */
  widthAtEyes: number;
  /** Share of the forehead covered by hair. */
  bangs: number;
  /** Share of the lower face covered by hair. */
  beard: number;
  /** Share of the eye band labelled as accessories. */
  glasses: number;
  /** Local contrast inside the hair (curly/textured hair scores higher). */
  texture: number;
}

export interface Pose {
  yaw: number;
  pitch: number;
  roll: number;
}

export type Warning = 'turned' | 'tilted' | 'mouth-open' | 'eyes-closed' | 'small' | 'dark' | 'multiple';

export interface FaceAnalysis {
  index: number;
  pose: Pose;
  features: FaceFeatures;
  hair: HairFeatures;
  palette: Palette;
  /** Beard and mustache coverage (the segmenter mostly calls beards skin). */
  facialHair: { beard: number; mustache: number; color: string | null };
  mask: SegmentMask;
  warnings: Warning[];
  ms: { segment: number; measure: number };
}

export interface PhotoAnalysis {
  /** Upright, downscaled working image. */
  image: HTMLCanvasElement;
  rotation: 0 | 90 | 180 | 270;
  faces: DetectedFace[];
  selected: number;
  face: FaceAnalysis | null;
  ms: { decode: number; detect: number };
}
