/**
 * Frames the raw captures in captures/raw/<slug>/ as cinematic slides (aurora backdrop, browser or phone
 * frame, soft shadow and ambient glow), optimizes them and sets them as the project's cover and gallery.
 * The draft in captures/raw/<slug>/project.json is merged into content/projects.json. See captures/README.md.
 *
 *   pnpm media:cinematic clixa-tools              compose and write to content
 *   pnpm media:cinematic clixa-tools --preview    compose into captures/out/<slug>/ only
 *   pnpm media:cinematic funkey --append          keep the existing media and add after it
 *   pnpm media:cinematic funkey --text-only       merge project.json without touching media
 */
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, promisify } from 'node:util';

import { chromium, type Page } from 'playwright';
import sharp from 'sharp';
import { z } from 'zod';

import { type ProjectMedia, projectSchema } from '../src/lib/schemas';
import { readContent, writeContent } from '../src/server/content-store';
import { processMedia } from '../src/server/media-store';

const execFileAsync = promisify(execFile);

const WIDTH = 1600;
const HEIGHT = 1000;
const SCALE = 1.5;
const OUTPUT_WIDTH = WIDTH * SCALE;
const VIDEO_OUTPUT_WIDTH = 1920;
const MAX_CLIP_SECONDS = 14;
const BAR_HEIGHT = 34;
const WINDOW_RADIUS = 14;
const PHONE_BEZEL = 11;
const PHONE_RADIUS = 54;

const shotSchema = z.object({
  file: z.string().min(1),
  caption: z.string().default(''),
  device: z.enum(['desktop', 'mobile']).default('desktop'),
  url: z.string().optional(),
  kind: z.enum(['image', 'video']).optional(),
});
type Shot = z.infer<typeof shotSchema>;
const manifestSchema = z.object({ shots: z.array(shotSchema).min(1) });

interface Slide {
  kind: 'image' | 'video';
  device: 'desktop' | 'mobile';
  shots: Shot[];
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    preview: { type: 'boolean', default: false },
    append: { type: 'boolean', default: false },
    'text-only': { type: 'boolean', default: false },
  },
});

const [slug] = positionals;
if (!slug) {
  console.error('Usage: pnpm media:cinematic <slug> [--preview] [--append] [--text-only]');
  process.exit(1);
}

const rawDir = path.join(process.cwd(), 'captures', 'raw', slug);
const outDir = path.join(process.cwd(), 'captures', 'out', slug);
const isVideoFile = (file: string) => /\.(webm|mp4|mov)$/i.test(file);

/* Slide planning */

function planSlides(shots: Shot[]): Slide[] {
  const slides: Slide[] = [];
  for (const shot of shots) {
    const kind = shot.kind ?? (isVideoFile(shot.file) ? 'video' : 'image');
    const previous = slides.at(-1);
    // Consecutive mobile screenshots share one slide, side by side.
    if (kind === 'image' && shot.device === 'mobile' && previous?.kind === 'image' && previous.device === 'mobile' && previous.shots.length === 1) {
      previous.shots.push(shot);
      continue;
    }
    slides.push({ kind, device: shot.device, shots: [shot] });
  }
  return slides;
}

async function dimensions(file: string): Promise<{ width: number; height: number }> {
  if (!isVideoFile(file)) {
    const meta = await sharp(file).metadata();
    return { width: meta.width ?? 16, height: meta.height ?? 10 };
  }
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file,
  ]);
  const [width, height] = stdout.trim().split(',').map(Number);
  return { width: width ?? 16, height: height ?? 10 };
}

async function posterFrame(video: string, target: string): Promise<string> {
  await execFileAsync('ffmpeg', ['-loglevel', 'error', '-y', '-i', video, '-vf', 'thumbnail=30', '-frames:v', '1', target]);
  return target;
}

/* Scene markup */

const fontUrl = (file: string) => pathToFileURL(path.join(process.cwd(), 'src', 'cv', 'fonts', file)).href;
const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Aurora blobs in the site's dark palette, mirrored per slide so a carousel does not repeat itself. */
function backdrop(index: number): string {
  const blobs: [string, number, number, number][] = [
    ['#178559', 14, 20, 58],
    ['#156b78', 86, 80, 66],
    ['#0b5038', 72, 6, 42],
    ['#1b5f73', 18, 94, 38],
  ];
  const flipX = index % 2 === 1;
  const flipY = index % 3 === 2;
  return blobs
    .map(([color, x, y, size]) => {
      const left = flipX ? 100 - x : x;
      const top = flipY ? 100 - y : y;
      return `<div class="blob" style="left:${left}%;top:${top}%;width:${size}vw;height:${size}vw;background:${color}"></div>`;
    })
    .join('');
}

const tilts = ['none', 'rotateY(-12deg) rotateX(5deg) rotateZ(0.6deg) scale(0.95)', 'none', 'rotateY(12deg) rotateX(5deg) rotateZ(-0.6deg) scale(0.95)'];

interface ScreenInput {
  src: string;
  ratio: number;
  /** The glow behind the frame, usually the screenshot itself. */
  glow: string;
  label: string;
  video: boolean;
}

function desktopScene(screen: ScreenInput, tilt: string): string {
  const maxWidth = tilt === 'none' ? 1260 : 1180;
  const maxHeight = HEIGHT - 150 - BAR_HEIGHT;
  const width = Math.round(Math.min(maxWidth, maxHeight * screen.ratio));
  const height = Math.round(width / screen.ratio);
  const content = screen.video
    ? `<div id="screen" data-radius-bottom="${WINDOW_RADIUS}" style="height:${height}px"></div>`
    : `<img id="screen" src="${screen.src}" style="height:${height}px">`;
  return `
    <div class="glow" style="width:${width}px;height:${height + BAR_HEIGHT}px;background-image:url('${screen.glow}');transform:${tilt} translateY(40px) scale(1.05)"></div>
    <div class="window" style="width:${width}px;transform:${tilt}">
      <div class="bar"><i></i><i></i><i></i><span>${escapeHtml(screen.label)}</span></div>
      ${content}
    </div>`;
}

function phoneScene(screens: ScreenInput[]): string {
  const pair = screens.length > 1;
  const screenHeight = pair ? 780 : 820;
  return screens
    .map((screen, index) => {
      const width = Math.round(screenHeight * screen.ratio);
      const transform = pair ? (index === 0 ? 'rotate(-3deg) translateY(-18px)' : 'rotate(3deg) translateY(34px)') : 'none';
      const content = screen.video
        ? `<div id="screen" data-radius="${PHONE_RADIUS - PHONE_BEZEL}" style="width:${width}px;height:${screenHeight}px"></div>`
        : `<img src="${screen.src}" style="width:${width}px;height:${screenHeight}px">`;
      return `
        <div class="phone-slot" style="transform:${transform}">
          <div class="glow" style="inset:0;background-image:url('${screen.glow}');transform:translateY(40px) scale(1.08)"></div>
          <div class="phone">${content}</div>
        </div>`;
    })
    .join('');
}

function page(index: number, stage: string, transparent: boolean): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: Geist; src: url('${fontUrl('Geist-Medium.ttf')}'); }
    * { margin: 0; box-sizing: border-box; }
    html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: ${transparent ? 'transparent' : '#060807'}; }
    #scene { position: absolute; inset: 0; overflow: hidden; background: #060807; }
    .blob { position: absolute; border-radius: 50%; transform: translate(-50%, -50%); filter: blur(130px); opacity: 0.5; }
    .grain { position: absolute; inset: 0; background-image: ${grain}; opacity: 0.08; mix-blend-mode: overlay; }
    .vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0, 0, 0, 0.6)); }
    .stage { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 56px; perspective: 2800px; }
    .glow { position: absolute; background-size: cover; background-position: top; filter: blur(80px) saturate(1.6); opacity: 0.42; border-radius: 40px; }
    .window { position: relative; border-radius: ${WINDOW_RADIUS}px; overflow: hidden; background: #0f1211;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 60px 120px -24px rgba(0, 0, 0, 0.8), 0 28px 56px -28px rgba(0, 0, 0, 0.9); }
    .bar { position: relative; height: ${BAR_HEIGHT}px; display: flex; align-items: center; gap: 7px; padding: 0 14px;
      background: linear-gradient(#181c1b, #121514); border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
    .bar i { width: 11px; height: 11px; border-radius: 50%; background: #2b302e; }
    .bar span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      font: 500 12.5px Geist, sans-serif; color: #7c8683; letter-spacing: 0.01em; }
    #screen, .window img { display: block; width: 100%; object-fit: cover; object-position: top; }
    .phone-slot { position: relative; }
    .phone { position: relative; padding: ${PHONE_BEZEL}px; border-radius: ${PHONE_RADIUS}px; background: #0c0e0e;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 60px 110px -20px rgba(0, 0, 0, 0.85); }
    .phone img, .phone #screen { display: block; border-radius: ${PHONE_RADIUS - PHONE_BEZEL}px; object-fit: cover; object-position: top; }
  </style></head><body>
    <div id="scene">
      ${backdrop(index)}
      <div class="grain"></div>
      <div class="vignette"></div>
      <div class="stage">${stage}</div>
    </div>
  </body></html>`;
}

async function render(browser: Page, html: string, file: string): Promise<void> {
  await writeFile(file, html);
  await browser.goto(pathToFileURL(file).href);
  await browser.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) => (image.complete ? undefined : new Promise((done) => (image.onload = image.onerror = done)))),
    );
  });
}

/** Cuts a transparent hole where #screen is, so ffmpeg can place the video underneath. */
async function screenHole(browser: Page): Promise<{ x: number; y: number; width: number; height: number }> {
  return browser.evaluate(
    ({ width, height }) => {
      const screen = document.getElementById('screen')!;
      const rect = screen.getBoundingClientRect();
      const all = Number(screen.dataset.radius ?? 0);
      const bottom = Number(screen.dataset.radiusBottom ?? all);
      const top = all;
      const { x, y, width: w, height: h } = rect;
      const hole = [
        `M${x + top} ${y}`, `H${x + w - top}`, `Q${x + w} ${y} ${x + w} ${y + top}`,
        `V${y + h - bottom}`, `Q${x + w} ${y + h} ${x + w - bottom} ${y + h}`,
        `H${x + bottom}`, `Q${x} ${y + h} ${x} ${y + h - bottom}`,
        `V${y + top}`, `Q${x} ${y} ${x + top} ${y}`, 'Z',
      ].join(' ');
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><path fill-rule='evenodd' d='M0 0H${width}V${height}H0Z ${hole}'/></svg>`;
      const scene = document.getElementById('scene')!;
      const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      scene.style.maskImage = mask;
      scene.style.setProperty('-webkit-mask-image', mask);
      return { x, y, width: w, height: h };
    },
    { width: WIDTH, height: HEIGHT },
  );
}

const even = (value: number) => Math.round(value / 2) * 2;

async function composeSlide(browser: Page, slide: Slide, index: number, label: string): Promise<{ file: string; mimeType: string; caption: string }> {
  const caption = slide.shots.map((shot) => shot.caption).find(Boolean) ?? '';
  const stageFile = path.join(outDir, `.stage-${index}.html`);
  const screens: ScreenInput[] = await Promise.all(
    slide.shots.map(async (shot) => {
      const source = path.join(rawDir, shot.file);
      const size = await dimensions(source);
      const video = slide.kind === 'video';
      const glow = video ? await posterFrame(source, path.join(outDir, `.poster-${index}.png`)) : source;
      return {
        src: pathToFileURL(source).href,
        ratio: size.width / size.height,
        glow: pathToFileURL(glow).href,
        label: shot.url ?? label,
        video,
      };
    }),
  );

  const tilt = slide.kind === 'video' ? 'none' : (tilts[index % tilts.length] ?? 'none');
  const stage = slide.device === 'mobile' ? phoneScene(screens) : desktopScene(screens[0]!, tilt);
  await render(browser, page(index, stage, slide.kind === 'video'), stageFile);

  const name = String(index + 1).padStart(2, '0');
  if (slide.kind === 'image') {
    const file = path.join(outDir, `${name}.png`);
    await browser.screenshot({ path: file });
    return { file, mimeType: 'image/png', caption };
  }

  const hole = await screenHole(browser);
  const overlay = path.join(outDir, `.overlay-${index}.png`);
  await browser.screenshot({ path: overlay, omitBackground: true });

  // One pixel of bleed under the frame edge hides anti-aliasing seams.
  const x = Math.floor(hole.x * SCALE) - 1;
  const y = Math.floor(hole.y * SCALE) - 1;
  const w = even(hole.width * SCALE + 2);
  const h = even(hole.height * SCALE + 2);
  const file = path.join(outDir, `${name}.mp4`);
  const size = `${OUTPUT_WIDTH}x${HEIGHT * SCALE}`;
  await execFileAsync('ffmpeg', [
    '-loglevel', 'error', '-y',
    '-i', path.join(rawDir, slide.shots[0]!.file),
    '-i', overlay,
    '-filter_complex',
    `color=c=#060807:s=${size}:r=30[base];` +
      `[0:v]fps=30,scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}:(iw-${w})/2:0,setsar=1[clip];` +
      `[base][clip]overlay=${x}:${y}:shortest=1[layered];[layered][1:v]overlay=0:0,format=yuv420p`,
    // Long recordings are trimmed; a carousel clip should loop quickly.
    '-t', String(MAX_CLIP_SECONDS),
    '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-movflags', '+faststart', file,
  ], { maxBuffer: 16 * 1024 * 1024 });
  return { file, mimeType: 'video/mp4', caption };
}

/* Main */

const draftText = await readFile(path.join(rawDir, 'project.json'), 'utf8').catch(() => undefined);
const draft = draftText ? (JSON.parse(draftText) as Record<string, unknown>) : undefined;
const projects = await readContent('projects');
const index = projects.findIndex((project) => project.slug === slug);
const existing = projects[index];
if (!existing && !draft && !values.preview) {
  console.error(`No project "${slug}" in content and no ${path.relative(process.cwd(), rawDir)}/project.json draft.`);
  process.exit(1);
}

let composed: ProjectMedia[] | undefined;

if (!values['text-only']) {
  const manifest = manifestSchema.parse(JSON.parse(await readFile(path.join(rawDir, 'manifest.json'), 'utf8')));
  const slides = planSlides(manifest.shots);
  const label = (draft?.name as string | undefined) ?? existing?.name ?? slug;

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: SCALE });
  const tab = await context.newPage();
  const outputs = [];
  try {
    for (const [slideIndex, slide] of slides.entries()) {
      outputs.push(await composeSlide(tab, slide, slideIndex, label));
      console.log(`composed ${slideIndex + 1}/${slides.length}`);
    }
  } finally {
    await browser.close();
  }

  if (values.preview) {
    console.log(`Preview written to ${path.relative(process.cwd(), outDir)}`);
    process.exit(0);
  }

  composed = [];
  for (const output of outputs) {
    composed.push(
      await processMedia({
        data: await readFile(output.file),
        fileName: `${slug}-${path.basename(output.file)}`,
        mimeType: output.mimeType,
        folder: `media/projects/${slug}`,
        alt: output.caption,
        maxWidth: output.mimeType === 'video/mp4' ? VIDEO_OUTPUT_WIDTH : OUTPUT_WIDTH,
      }),
    );
  }
}

const previousMedia = existing ? [existing.cover, ...existing.gallery].filter((media) => media !== undefined) : [];
const media = composed ? [...(values.append ? previousMedia : []), ...composed] : previousMedia;

const entry = projectSchema.parse({
  featured: false,
  overview: [],
  features: [],
  challenges: [],
  ...existing,
  ...draft,
  slug,
  cover: media[0],
  gallery: media.slice(1),
});

if (index === -1) projects.push(entry);
else projects[index] = entry;
await writeContent('projects', projects);

// Replaced media files are removed so repeated runs do not pile up old captures.
if (composed && !values.append) {
  const kept = new Set(media.flatMap((item) => (item.kind === 'video' ? [item.src, item.poster] : [item.src])));
  const stale = previousMedia
    .flatMap((item) => (item.kind === 'video' ? [item.src, item.poster] : [item.src]))
    .filter((src) => !kept.has(src) && src.startsWith(`/media/projects/${slug}/`));
  await Promise.all(stale.map((src) => rm(path.join(process.cwd(), 'public', src), { force: true })));
}

console.log(`${slug}: ${media.length} media items, ${index === -1 ? 'added' : 'updated'} in content/projects.json`);
