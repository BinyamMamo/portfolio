/**
 * Renders each page of a CV to a PNG, for checking a layout by eye.
 *   pnpm cv:preview                      the default CV
 *   pnpm cv:preview --template sidebar
 *   pnpm cv:preview --variant acme --dpi 140
 *
 * Type and content checks cannot see a heading stranded at a page break or a skills row overflowing
 * its column, so look at the pages before sending a CV anywhere.
 */
import { execFile } from 'node:child_process';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs, promisify } from 'node:util';

import { getResolvedCv } from '../src/cv/load';
import { renderCvPdf } from '../src/cv/render';
import { cvTemplateIds, type CvTemplateId } from '../src/lib/schemas';
import { CV_PDF_DIR, CV_PREVIEW_DIR } from './cv-paths.mts';

const run = promisify(execFile);

const { values } = parseArgs({
  options: {
    template: { type: 'string' },
    variant: { type: 'string' },
    dpi: { type: 'string' },
  },
});

if (values.template && !cvTemplateIds.includes(values.template as CvTemplateId)) {
  console.error(`Unknown template "${values.template}". Use one of: ${cvTemplateIds.join(', ')}`);
  process.exit(1);
}

const cv = await getResolvedCv({ variant: values.variant, template: values.template as CvTemplateId | undefined });
if (!cv) {
  console.error(`No CV version named "${values.variant}" in content/cv/variants.`);
  process.exit(1);
}

const name = `${cv.fileName}${values.template ? `-${cv.template}` : ''}`;
const pdf = path.join(CV_PDF_DIR, `${name}.pdf`);
await mkdir(CV_PDF_DIR, { recursive: true });
await writeFile(pdf, await renderCvPdf(cv));

// Cleared first, so a CV that loses a page does not leave the old one lying around.
const dir = path.join(CV_PREVIEW_DIR, name);
await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });

try {
  await run('pdftoppm', ['-png', '-r', values.dpi ?? '110', pdf, path.join(dir, 'page')]);
} catch (error) {
  const reason = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'is not installed' : 'failed';
  console.error(`pdftoppm ${reason}. Install poppler-utils to render previews.`);
  process.exit(1);
}

const pages = (await readdir(dir)).sort();
console.log(`${pdf}\n${pages.map((page) => `  ${path.join(dir, page)}`).join('\n')}`);
