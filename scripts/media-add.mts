/**
 * Adds an image, GIF or video to a project, processed the same way as dashboard uploads.
 *   pnpm media:add path/to/demo.gif --project funkey --alt "Practice mode"
 *   pnpm media:add cover.png --project funkey --cover
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { readContent, writeContent } from '../src/server/content-store';
import { processMedia } from '../src/server/media-store';

const mimeTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    project: { type: 'string' },
    alt: { type: 'string', default: '' },
    cover: { type: 'boolean', default: false },
  },
});

const [file] = positionals;
if (!file || !values.project) {
  console.error('Usage: pnpm media:add <file> --project <slug> [--alt "text"] [--cover]');
  process.exit(1);
}

const mimeType = mimeTypes[path.extname(file).toLowerCase()];
if (!mimeType) {
  console.error(`Unsupported file type: ${path.extname(file)}`);
  process.exit(1);
}

const projects = await readContent('projects');
const project = projects.find((item) => item.slug === values.project);
if (!project) {
  console.error(`No project with slug "${values.project}".`);
  process.exit(1);
}

const media = await processMedia({
  data: await readFile(file),
  fileName: path.basename(file),
  mimeType,
  folder: `media/projects/${project.slug}`,
  alt: values.alt,
});

if (values.cover || !project.cover) project.cover = media;
else project.gallery.push(media);

await writeContent('projects', projects);
console.log(`Added ${media.src} to ${project.slug} as ${values.cover || project.cover === media ? 'cover' : 'gallery item'}`);
