# Avatar runtime

The files under `engine/`, `persona/` and `analyze/` are copied from the twin project, which draws
this cartoon without Pixi or WebGL. twin's own plan calls this the "copy the code" route: an avatar is
plain JSON plus drawing code.

- `persona.json` is the avatar itself, exported from twin after analyzing a selfie.
- `detail-mesh.json` and `public/media/avatar-detail.webp` are twin's detail layer: the photo's own
  lines and shadows, and the face triangles they are mapped onto. The mesh was built once with twin's
  `buildPuppetMesh`, so the site does not need twin's triangulation libraries.
- `stage.ts` is the only file written here. It runs the loop, applies twin's ink look (outlines and
  fills eased toward paper), and draws the detail layer in Canvas2D: every triangle is mapped onto the
  posed face on an offscreen layer, then multiplied over the cartoon once, clipped to the face.
- The copies keep twin's formatting and carry `@ts-nocheck`, because twin compiles without
  `noUncheckedIndexedAccess`. Re-copy them from twin rather than editing them here.
