// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/persona/persona.ts), which draws this avatar without Pixi. */
import { hexToLab, labToHex } from '../analyze/color';
import type { HairShape } from './hair';
import type { FaceShape } from './shape';

export interface PersonaColors {
  skin: string;
  skinShade: string;
  hair: string;
  /** Beard and mustache (grey beards often differ from the hair). */
  beard: string;
  brows: string;
  eyes: string;
  lips: string;
  clothes: string;
}

/** Everything the cartoon twin is drawn from. Plain data, so it can be tweaked, saved and tested. */
export interface Persona {
  shape: FaceShape;
  hair: HairShape;
  colors: PersonaColors;
  glasses: boolean;
  /** 0 = none, stubble around 0.3–0.6, full beard toward 1. */
  beard: number;
  mustache: number;
  /** How far features are pushed from the average face (1 = as measured). */
  exaggeration: number;
}

/** Darker version of a colour (lightness scaled down by `amount`). */
export function shade(hex: string, amount: number): string {
  const lab = hexToLab(hex);
  return labToHex({ L: lab.L * (1 - amount), a: lab.a * 1.05, b: lab.b * 1.05 });
}
