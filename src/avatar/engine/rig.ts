// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/engine/rig.ts), which draws this avatar without Pixi. */
/**
 * The normalized pose every driver writes and every avatar reads.
 * Drivers (idle, pointer, face, voice) never know about avatars; avatars never know about drivers.
 *
 * Conventions (screen space, y down):
 * - headYaw   -1..1  + turns toward screen right
 * - headPitch -1..1  + looks down
 * - headRoll  -1..1  + tilts clockwise
 * - gazeX/Y   -1..1  + right / down
 * - eyeOpenL/R 0..1  L = eye on the screen-left side
 * - browL/R   -1..1  + raised
 * - mouthOpen  0..1
 * - mouthWide -1..1  + stretched wide, - puckered
 * - mouthForm -1..1  + smile, - frown
 * - breath     0..1  inhale amount
 */
export interface RigState {
  headYaw: number;
  headPitch: number;
  headRoll: number;
  gazeX: number;
  gazeY: number;
  eyeOpenL: number;
  eyeOpenR: number;
  browL: number;
  browR: number;
  mouthOpen: number;
  mouthWide: number;
  mouthForm: number;
  breath: number;
}

export type RigChannel = keyof RigState;

export const RIG_RANGES: Readonly<Record<RigChannel, readonly [number, number]>> = {
  headYaw: [-1, 1],
  headPitch: [-1, 1],
  headRoll: [-1, 1],
  gazeX: [-1, 1],
  gazeY: [-1, 1],
  eyeOpenL: [0, 1],
  eyeOpenR: [0, 1],
  browL: [-1, 1],
  browR: [-1, 1],
  mouthOpen: [0, 1],
  mouthWide: [-1, 1],
  mouthForm: [-1, 1],
  breath: [0, 1],
};

export const RIG_CHANNELS = Object.keys(RIG_RANGES) as RigChannel[];

/** Closest Live2D standard parameters, for a future Live2D/Inochi2D renderer. */
export const LIVE2D_IDS: Readonly<Record<RigChannel, string>> = {
  headYaw: 'ParamAngleX',
  headPitch: 'ParamAngleY',
  headRoll: 'ParamAngleZ',
  gazeX: 'ParamEyeBallX',
  gazeY: 'ParamEyeBallY',
  eyeOpenL: 'ParamEyeLOpen',
  eyeOpenR: 'ParamEyeROpen',
  browL: 'ParamBrowLY',
  browR: 'ParamBrowRY',
  mouthOpen: 'ParamMouthOpenY',
  mouthWide: 'ParamMouthWide',
  mouthForm: 'ParamMouthForm',
  breath: 'ParamBreath',
};

export function neutralRig(): RigState {
  return {
    headYaw: 0,
    headPitch: 0,
    headRoll: 0,
    gazeX: 0,
    gazeY: 0,
    eyeOpenL: 1,
    eyeOpenR: 1,
    browL: 0,
    browR: 0,
    mouthOpen: 0,
    mouthWide: 0,
    mouthForm: 0,
    breath: 0,
  };
}

export function copyRig(src: Readonly<RigState>, dst: RigState): RigState {
  for (const k of RIG_CHANNELS) dst[k] = src[k];
  return dst;
}

export function clampRig(rig: RigState): RigState {
  for (const k of RIG_CHANNELS) {
    const [lo, hi] = RIG_RANGES[k];
    rig[k] = rig[k] < lo ? lo : rig[k] > hi ? hi : rig[k];
  }
  return rig;
}
