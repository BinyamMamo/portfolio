/**
 * Turns uploaded files into web-ready media under public/. Images become WebP; animated GIFs and videos
 * become an MP4 clip with a WebP poster (ffmpeg). No framework imports, so scripts can use it too.
 */
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import sharp from 'sharp';

import type { ProjectMedia } from '@/lib/schemas';
import { slugify } from '@/lib/slug';

const execFileAsync = promisify(execFile);

const PUBLIC_DIR = path.join(process.cwd(), 'public');
export const MAX_UPLOAD_BYTES = 60 * 1024 * 1024;
const IMAGE_MAX_WIDTH = 1600;
const VIDEO_MAX_WIDTH = 1280;
/** Folders (relative to public/) that uploads may be written to. */
const FOLDER_PATTERN = /^media\/(projects\/[a-z0-9]+(-[a-z0-9]+)*|profile)$/;

/** A problem with the upload itself, safe to show to the user. */
export class MediaError extends Error {}
class FfmpegMissingError extends Error {}

export interface MediaInput {
  data: Buffer;
  fileName: string;
  mimeType: string;
  /** Destination relative to public/, for example media/projects/funkey */
  folder: string;
  alt?: string;
  /** Overrides the default maximum width, for example for framed showcase captures. */
  maxWidth?: number;
}

async function ffmpeg(args: string[]): Promise<void> {
  try {
    await execFileAsync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { maxBuffer: 16 * 1024 * 1024 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new FfmpegMissingError();
    throw error;
  }
}

export async function processMedia({
  data,
  fileName,
  mimeType,
  folder,
  alt = '',
  maxWidth,
}: MediaInput): Promise<ProjectMedia> {
  const imageMaxWidth = maxWidth ?? IMAGE_MAX_WIDTH;
  const videoMaxWidth = maxWidth ?? VIDEO_MAX_WIDTH;
  if (!FOLDER_PATTERN.test(folder)) throw new MediaError('Uploads can only go into a project or profile media folder.');
  if (data.byteLength > MAX_UPLOAD_BYTES) throw new MediaError('Files must be 60 MB or smaller.');

  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  if (!isImage && !isVideo) throw new MediaError('Only images, GIFs and videos can be uploaded.');

  const targetDir = path.join(PUBLIC_DIR, folder);
  await mkdir(targetDir, { recursive: true });
  const base = `${slugify(path.parse(fileName).name) || 'media'}-${randomBytes(3).toString('hex')}`;
  const publicPath = (file: string) => `/${folder}/${file}`;
  const posterFile = path.join(targetDir, `${base}.webp`);

  const animated =
    mimeType === 'image/gif' && ((await sharp(data, { animated: true }).metadata()).pages ?? 1) > 1;

  if (isImage && !animated) {
    const info = await sharp(data)
      .rotate()
      .resize({ width: imageMaxWidth, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(posterFile);
    return { kind: 'image', src: publicPath(`${base}.webp`), alt, width: info.width, height: info.height };
  }

  const workDir = await mkdtemp(path.join(tmpdir(), 'portfolio-media-'));
  try {
    const input = path.join(workDir, `input${path.extname(fileName) || '.bin'}`);
    await writeFile(input, data);
    // Even dimensions are required by H.264.
    const scale = `scale='trunc(min(${videoMaxWidth},iw)/2)*2':-2:flags=lanczos`;
    await ffmpeg([
      '-i', input,
      '-vf', `${scale},format=yuv420p`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
      '-movflags', '+faststart', '-an',
      path.join(targetDir, `${base}.mp4`),
    ]);
    await ffmpeg(['-i', input, '-vf', `thumbnail=40,${scale}`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', posterFile]);

    const poster = await sharp(posterFile).metadata();
    return {
      kind: 'video',
      src: publicPath(`${base}.mp4`),
      poster: publicPath(`${base}.webp`),
      alt,
      width: poster.width ?? videoMaxWidth,
      height: poster.height ?? Math.round(videoMaxWidth * 0.5625),
    };
  } catch (error) {
    if (!(error instanceof FfmpegMissingError)) throw error;
    if (!animated) throw new MediaError('Install ffmpeg to upload videos.');

    // Without ffmpeg, keep the animation as an animated WebP instead.
    await sharp(data, { animated: true })
      .resize({ width: imageMaxWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(posterFile);
    const output = await sharp(posterFile, { animated: true }).metadata();
    return {
      kind: 'image',
      src: publicPath(`${base}.webp`),
      alt,
      width: output.width ?? imageMaxWidth,
      height: output.pageHeight ?? output.height ?? imageMaxWidth,
    };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
