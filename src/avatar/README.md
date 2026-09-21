# Avatar runtime

The files under `engine/`, `persona/` and `analyze/` are copied from the
[twin](https://github.com/BinyamMamo/twin) project, which draws this cartoon without Pixi or WebGL.
twin's own plan calls this the "copy the code" route: an avatar is plain JSON plus drawing code.

- `persona.json` is the avatar itself, exported from twin after analyzing a selfie.
- `stage.ts` is the only file written here: it steps the physics and draws a frame into a canvas.
- The copies keep twin's formatting and carry `@ts-nocheck`, because twin compiles without
  `noUncheckedIndexedAccess`. Re-copy them from twin rather than editing them here.
