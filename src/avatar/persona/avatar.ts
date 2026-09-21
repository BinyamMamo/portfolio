// @ts-nocheck -- vendored from twin, which compiles without noUncheckedIndexedAccess.
/* Vendored from the twin project (src/persona/avatar.ts), which draws this avatar without Pixi. */
import { smoothClosed } from '../engine/brush';
import { defineAvatar, type AvatarDefinition } from '../engine/define-avatar';
import { clamp } from '../engine/math';
import type { Pen } from '../engine/pen';
import { project, projected } from '../engine/project';
import type { RigState } from '../engine/rig';
import { FACE_OVAL, LEFT_BROW, LEFT_EYE, LIPS_INNER, LIPS_OUTER, RIGHT_BROW, RIGHT_EYE } from '../analyze/landmarks';
import { HAIR_RAYS } from './hair';
import { shade, type Persona } from './persona';
import { FACE_POINTS } from './shape';

/** Where the eye midpoint sits in avatar space (the card spans -1..1). */
const EYE_Y = -0.12;
/** Face height (forehead landmark to chin) in avatar units, before hair limits it. */
const FACE_HEIGHT = 0.8;
const DEG = Math.PI / 180;
const YAW = 22 * DEG;
const PITCH = 14 * DEG;
const ROLL = 10 * DEG;
/** Depth scale: landmark depth is measured, a little flattening keeps turns gentle. */
const DEPTH = 0.8;

const LOWER_OUTER_LIP = LIPS_OUTER.slice(11, 20);
const LOWER_INNER_LIP = LIPS_INNER.slice(11, 20);
const UPPER_INNER_LIP = LIPS_INNER.slice(0, 11);
const UPPER_OUTER_LIP = LIPS_OUTER.slice(0, 11);
/** Mouth corners (outer, inner) per side. */
const CORNERS = [
  [61, 78],
  [291, 308],
];
/** Upper → lower lid pairs, outer to inner corner (see puppet/mesh.ts). */
const LIDS = [
  { ring: RIGHT_EYE, upper: [246, 161, 160, 159, 158, 157, 173], lower: [7, 163, 144, 145, 153, 154, 155], outer: 33, inner: 133 },
  { ring: LEFT_EYE, upper: [466, 388, 387, 386, 385, 384, 398], lower: [249, 390, 373, 374, 380, 381, 382], outer: 263, inner: 362 },
];
const BROWS = [RIGHT_BROW, LEFT_BROW];

/** Every face point as drawn this frame (avatar space), plus the lid travel, for layers drawn on top. */
export interface PersonaPose {
  posed: Record<number, [number, number]>;
  /** Per eye (photo right, left): how far the upper lid has come down, in avatar units. */
  lidDrop: [number, number];
}

/** The cartoon twin: every feature traced from the persona's face shape and hair, posed by the rig. */
export function createPersonaAvatar(persona: Persona, out?: PersonaPose): AvatarDefinition {
  const { shape, hair, colors } = persona;
  const pts = shape.points;
  const faceHeight = pts[152][1] - pts[10][1];
  // Fit the face, then shrink if the hair would leave the card.
  let unit = FACE_HEIGHT / faceHeight;
  const hairTop = hair.present ? Math.min(...hair.radius.map((r, k) => hair.centre.y - Math.cos((k / HAIR_RAYS) * Math.PI * 2) * r)) : pts[10][1];
  if (EYE_Y + hairTop * unit < -0.94) unit = (EYE_Y + 0.94) / -hairTop;

  const pivot = { x: 0, y: (pts[10][1] + pts[152][1]) / 2, z: 0.9 };
  const lowerLip = new Set([...LOWER_OUTER_LIP, ...LOWER_INNER_LIP]);
  const mouthY = (pts[61][1] + pts[291][1]) / 2;
  const mouthWidth = Math.abs(pts[291][0] - pts[61][0]);

  // how much each point drops with the jaw
  const jaw: Record<number, number> = {};
  for (const i of FACE_POINTS) {
    const [x, y] = pts[i];
    if (lowerLip.has(i)) jaw[i] = 1;
    else if (UPPER_INNER_LIP.includes(i) || UPPER_OUTER_LIP.includes(i)) jaw[i] = 0;
    else if (y > mouthY) jaw[i] = Math.min(1, (y - mouthY) / 0.3) * (1 - smooth(0.75, 1.25, Math.abs(x)));
    else jaw[i] = 0;
  }

  const posed: Record<number, [number, number]> = out?.posed ?? {};
  const p = projected();
  let head = { yaw: 0, pitch: 0, roll: 0, cos: 1, sin: 0, lift: 0 };

  /** Face coordinates (inter-eye units, depth +toward viewer) → avatar space with the head turned. */
  const place = (x: number, y: number, z: number, weight = 1): [number, number] => {
    project(x - pivot.x, y - pivot.y, z, head.yaw * weight, head.pitch * weight, p);
    const rx = p.x * head.cos - p.y * head.sin;
    const ry = p.x * head.sin + p.y * head.cos;
    const fx = x - pivot.x + (rx - (x - pivot.x)) * weight;
    const fy = y - pivot.y + (ry - (y - pivot.y)) * weight;
    return [(pivot.x + fx) * unit + head.yaw * 0.05, EYE_Y + (pivot.y + fy) * unit - head.lift];
  };

  const pose = (rig: Readonly<RigState>) => {
    head = {
      yaw: clamp(rig.headYaw, -1, 1) * YAW,
      pitch: clamp(rig.headPitch, -1, 1) * PITCH,
      roll: clamp(rig.headRoll, -1, 1) * ROLL,
      cos: Math.cos(clamp(rig.headRoll, -1, 1) * ROLL),
      sin: Math.sin(clamp(rig.headRoll, -1, 1) * ROLL),
      lift: rig.breath * 0.01,
    };
    const drop = clamp(rig.mouthOpen, 0, 1) * mouthWidth * 0.45;
    for (const i of FACE_POINTS) {
      let [x, y] = pts[i];
      y += drop * jaw[i];
      posed[i] = place(x, y, -pts[i][2] * DEPTH);
    }
    // mouth corners: wider and smile
    const wide = rig.mouthWide * mouthWidth * 0.08 * unit;
    const smile = rig.mouthForm * mouthWidth * 0.07 * unit * (1 - 0.6 * clamp(rig.mouthOpen, 0, 1));
    CORNERS.forEach((pair, side) => {
      for (const i of pair) {
        posed[i][0] += (side === 0 ? -1 : 1) * wide;
        posed[i][1] -= smile;
      }
    });
    // brows (+ = raised), screen-left brow is the photo's right brow
    BROWS.forEach((ring, side) => {
      const lift = (side === 0 ? rig.browL : rig.browR) * 0.1 * unit;
      for (const i of ring) posed[i][1] -= lift;
    });
  };

  const xy = (ring: readonly number[]) => {
    const xs = ring.map((i) => posed[i][0]);
    const ys = ring.map((i) => posed[i][1]);
    return { xs, ys };
  };

  return defineAvatar({
    id: 'persona',
    backdrop: { light: 0xe9e4f0, dark: 0x3a3446 },
    setup: () => ({
      draw(pen, rig) {
        pose(rig);
        drawBody(pen);
        if (hair.present) drawHair(pen, 'back');
        drawNeckAndEars(pen);
        if (!hair.present) drawSkull(pen);
        const oval = xy(FACE_OVAL);
        pen.beginPath();
        smoothClosed(pen, oval.xs, oval.ys).fill(colors.skin);
        drawFacialHair(pen);
        drawNose(pen);
        drawMouth(pen, rig);
        LIDS.forEach((lid, side) => drawEye(pen, lid, side === 0 ? rig.eyeOpenL : rig.eyeOpenR, rig));
        for (const ring of BROWS) {
          const b = xy(ring);
          pen.beginPath();
          smoothClosed(pen, b.xs, b.ys).fill(colors.brows);
        }
        if (hair.present) drawHair(pen, 'front');
        if (persona.glasses) drawGlasses(pen);
      },
    }),
  });

  function drawBody(pen: Pen) {
    const neckY = posed[152][1];
    const shoulder = 0.95;
    pen.beginPath().moveTo(-shoulder, 1.05).quadraticCurveTo(-shoulder, neckY + 0.3, -0.35, neckY + 0.2);
    pen.quadraticCurveTo(0, neckY + 0.24, 0.35, neckY + 0.2).quadraticCurveTo(shoulder, neckY + 0.3, shoulder, 1.05).closePath();
    pen.fill(colors.clothes);
  }

  function drawNeckAndEars(pen: Pen) {
    const [lx] = posed[172];
    const [rx] = posed[397];
    const w = (rx - lx) * 0.36;
    const cx = (lx + rx) / 2;
    const top = posed[152][1] - 0.12;
    const bottom = posed[152][1] + 0.26;
    pen.beginPath().moveTo(cx - w, top).lineTo(cx - w * 1.1, bottom).quadraticCurveTo(cx, bottom + 0.05, cx + w * 1.1, bottom).lineTo(cx + w, top).closePath();
    pen.fill(colors.skinShade);
    // ears at the sides of the face, between eye and nose height
    for (const [i, dir] of [
      [234, -1],
      [454, 1],
    ] as const) {
      const [x, y] = posed[i];
      pen.beginPath().ellipse(x + dir * 0.012, y + 0.035, 0.055, 0.1, dir * 0.12).fill(colors.skin);
      pen.beginPath().ellipse(x + dir * 0.022, y + 0.035, 0.022, 0.055, dir * 0.12).fill(colors.skinShade, { alpha: 0.7, ink: false });
    }
  }

  /** The top of the head: the face oval stops at the forehead, which reads as flat on a bald head. */
  function drawSkull(pen: Pen) {
    // the face oval above the cheekbones, swelled outward more toward the crown
    const [cx, cy] = [(posed[234][0] + posed[454][0]) / 2, (posed[234][1] + posed[454][1]) / 2];
    const top = cy - posed[10][1];
    const xs: number[] = [];
    const ys: number[] = [];
    for (const i of FACE_OVAL) {
      const [x, y] = posed[i];
      const up = clamp((cy - y) / top, 0, 1);
      const grow = 1 + 0.2 * up ** 1.5;
      xs.push(cx + (x - cx) * (1 + 0.04 * up - 0.14 * up ** 4));
      ys.push(cy + (y - cy) * (y < cy ? grow : 1));
    }
    pen.beginPath();
    smoothClosed(pen, xs, ys).fill(colors.skin);
  }

  function drawFacialHair(pen: Pen) {
    const color = colors.beard;
    if (persona.beard > 0.2) {
      // lower face from cheek to cheek, cut around the mouth
      const ring = FACE_OVAL.slice(FACE_OVAL.indexOf(361), FACE_OVAL.indexOf(132) + 1);
      const r = xy(ring);
      const [nx, ny] = posed[2];
      const mw = Math.abs(posed[291][0] - posed[61][0]);
      pen.beginPath().moveTo(r.xs[0], r.ys[0]);
      for (let k = 1; k < r.xs.length; k++) pen.lineTo(r.xs[k], r.ys[k]);
      pen.quadraticCurveTo(nx - mw * 0.9, ny + 0.01, nx, ny + 0.012).quadraticCurveTo(nx + mw * 0.9, ny + 0.01, r.xs[0], r.ys[0]);
      pen.closePath();
      // a tint, not a block: the photo's own stubble is drawn over it by the detail layer
      pen.fill(color, { alpha: persona.beard > 0.55 ? 0.42 : 0.15 + persona.beard * 0.3 });
      pen.beginPath();
      const lips = xy(LIPS_OUTER);
      smoothClosed(pen, lips.xs, lips.ys).cut();
    } else if (persona.mustache > 0.45) {
      const [nx, ny] = posed[2];
      const up = xy(UPPER_OUTER_LIP);
      pen.beginPath().moveTo(up.xs[0], up.ys[0]);
      for (let k = 1; k < up.xs.length; k++) pen.lineTo(up.xs[k], up.ys[k]);
      pen.quadraticCurveTo(nx + 0.05, ny, nx, ny + 0.008).quadraticCurveTo(nx - 0.05, ny, up.xs[0], up.ys[0]).closePath();
      pen.fill(color, { alpha: 0.85 });
    }
  }

  function drawNose(pen: Pen) {
    const line = shade(colors.skin, 0.28);
    const [ax, ay] = posed[98];
    const [tx, ty] = posed[1];
    const [bx, by] = posed[327];
    const [sx, sy] = posed[2];
    pen.beginPath().moveTo(ax, ay).quadraticCurveTo(sx, sy + 0.02, bx, by);
    pen.stroke({ color: line, width: 0.012, cap: 'round' });
    const [qx, qy] = posed[195];
    pen.beginPath().moveTo(qx + 0.012, qy).quadraticCurveTo(tx + 0.02, ty - 0.02, tx + 0.008, ty + 0.01);
    pen.stroke({ color: line, width: 0.009, cap: 'round', alpha: 0.6 });
  }

  function drawMouth(pen: Pen, rig: Readonly<RigState>) {
    const lips = xy(LIPS_OUTER);
    pen.beginPath();
    smoothClosed(pen, lips.xs, lips.ys).fill(colors.lips);
    const inner = xy(LIPS_INNER);
    if (rig.mouthOpen > 0.04) {
      pen.beginPath();
      smoothClosed(pen, inner.xs, inner.ys).fill('#2a0e13', { ink: false });
      const up = xy(UPPER_INNER_LIP);
      const depth = Math.min((posed[14][1] - posed[13][1]) * 0.4, 0.035);
      pen.beginPath().moveTo(up.xs[0], up.ys[0]);
      for (let k = 1; k < up.xs.length; k++) pen.lineTo(up.xs[k], up.ys[k]);
      for (let k = up.xs.length - 1; k >= 0; k--) pen.lineTo(up.xs[k], up.ys[k] + depth);
      pen.closePath().fill('#f3ede4', { ink: false });
    }
    const seam = xy(UPPER_INNER_LIP);
    pen.beginPath().smoothThrough(seam.xs, seam.ys).stroke({ color: shade(colors.lips, 0.45), width: 0.009, cap: 'round' });
  }

  function drawEye(pen: Pen, lid: (typeof LIDS)[number], openness: number, rig: Readonly<RigState>) {
    const open = clamp(openness, 0, 1);
    const [ox, oy] = posed[lid.outer];
    const [ix, iy] = posed[lid.inner];
    const cx = (ox + ix) / 2;
    const cy = (oy + iy) / 2;
    const upper = lid.upper.map((i) => posed[i]);
    const lower = lid.lower.map((i) => posed[i]);
    // blink: the upper lid comes down to the lower one
    const up = upper.map(([x, y], k) => [x, y + (lower[k][1] - y) * (1 - open) * 0.95] as const);
    if (out) out.lidDrop[lid === LIDS[0] ? 0 : 1] = up.reduce((s, [, y], k) => s + y - upper[k][1], 0) / up.length;
    const outline = (pts: readonly (readonly [number, number])[]) => {
      pen.moveTo(ox, oy);
      for (const [x, y] of pts) pen.lineTo(x, y);
      pen.lineTo(ix, iy);
    };

    if (open > 0.12) {
      pen.beginPath();
      outline(up);
      for (let k = lower.length - 1; k >= 0; k--) pen.lineTo(lower[k][0], lower[k][1]);
      pen.closePath().fill('#fbf7f2', { ink: false });

      const width = Math.hypot(ix - ox, iy - oy);
      const r = shape.irisRadius * unit * 1.08;
      const gx = cx + clamp(rig.gazeX, -1, 1) * width * 0.16;
      const gy = cy + clamp(rig.gazeY, -1, 1) * width * 0.07 + r * 0.05;
      pen.beginPath().circle(gx, gy, r).fill(colors.eyes, { ink: false });
      pen.beginPath().circle(gx, gy, r * 0.48).fill('#120b0a', { ink: false });
      pen.beginPath().circle(gx - r * 0.35, gy - r * 0.38, r * 0.22).fill('#ffffff', { alpha: 0.9, ink: false });

      // skin lids over the iris, so it never spills outside the eye
      const lidHeight = width * 0.45;
      pen.beginPath();
      outline(up);
      pen.lineTo(ix, iy - lidHeight).lineTo(ox, oy - lidHeight).closePath().fill(colors.skin, { ink: false });
      pen.beginPath().moveTo(ox, oy);
      for (const [x, y] of lower) pen.lineTo(x, y);
      pen.lineTo(ix, iy).lineTo(ix, iy + lidHeight).lineTo(ox, oy + lidHeight).closePath().fill(colors.skin, { ink: false });
    }
    // lash line
    pen.beginPath();
    outline(up);
    pen.stroke({ color: '#1a1210', width: 0.013, cap: 'round', join: 'round' });
  }

  function drawHair(pen: Pen, layer: 'back' | 'front') {
    const behind = -0.35;
    if (layer === 'back') {
      const xs: number[] = [];
      const ys: number[] = [];
      hair.radius.forEach((r, k) => {
        const a = (k / HAIR_RAYS) * Math.PI * 2;
        // where there is no hair along a ray, tuck the outline inside the face
        const reach = r > 0 ? r : 0.55;
        const [x, y] = place(hair.centre.x + Math.sin(a) * reach, hair.centre.y - Math.cos(a) * reach, behind, 0.85);
        xs.push(x);
        ys.push(y);
      });
      pen.beginPath();
      smoothClosed(pen, xs, ys).fill(colors.hair);
      return;
    }
    // front: the top of the outline down to the hairline across the forehead
    const line = hair.hairline.filter((q): q is NonNullable<typeof q> => q !== null);
    if (line.length < 3) return;
    const angleOf = (q: { x: number; y: number }) => {
      const a = Math.atan2(q.x - hair.centre.x, -(q.y - hair.centre.y));
      return a < 0 ? a + Math.PI * 2 : a;
    };
    const start = angleOf(line[line.length - 1]); // right end, clockwise from top is positive
    const end = angleOf(line[0]); // left end
    const xs: number[] = [];
    const ys: number[] = [];
    const push = ([x, y]: [number, number]) => {
      xs.push(x);
      ys.push(y);
    };
    // over the top from the left end of the hairline to the right end
    const steps = 40;
    const from = end - Math.PI * 2;
    for (let s = 0; s <= steps; s++) {
      const a = from + ((start - from) * s) / steps;
      const k = Math.round((((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * HAIR_RAYS) % HAIR_RAYS;
      const r = Math.max(hair.radius[k], 0.9);
      push(place(hair.centre.x + Math.sin(a) * r, hair.centre.y - Math.cos(a) * r, 0.1, 0.95));
    }
    for (let k = line.length - 1; k >= 0; k--) push(place(line[k].x, line[k].y, 0.35, 1));
    pen.beginPath();
    smoothClosed(pen, xs, ys).fill(colors.hair);
  }

  function drawGlasses(pen: Pen) {
    const frame = '#18181b';
    const lenses = LIDS.map((lid) => {
      const [ox, oy] = posed[lid.outer];
      const [ix, iy] = posed[lid.inner];
      return { x: (ox + ix) / 2, y: (oy + iy) / 2, w: Math.abs(ix - ox) * 1.55 };
    });
    for (const l of lenses) {
      pen.beginPath().ellipse(l.x, l.y + 0.005, l.w * 0.55, l.w * 0.42);
      pen.fill('#ffffff', { alpha: 0.08, ink: false }).stroke({ color: frame, width: 0.016 });
    }
    const [a, b] = lenses;
    pen.beginPath().moveTo(a.x + a.w * 0.52, a.y - 0.01).quadraticCurveTo((a.x + b.x) / 2, a.y - 0.04, b.x - b.w * 0.52, b.y - 0.01);
    pen.stroke({ color: frame, width: 0.014 });
  }
}

function smooth(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
