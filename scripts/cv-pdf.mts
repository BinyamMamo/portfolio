/**
 * Renders a CV to a PDF file.
 *   pnpm cv:pdf                                  default CV and template
 *   pnpm cv:pdf --template modern                 another template
 *   pnpm cv:pdf --variant acme --out cv-out/acme.pdf
 * Output defaults to cv-out/<file name>.pdf (gitignored).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { getResolvedCv } from '../src/cv/load';
import { renderCvPdf } from '../src/cv/render';
import { cvTemplateIds, type CvTemplateId } from '../src/lib/schemas';

const { values } = parseArgs({
  options: {
    template: { type: 'string' },
    variant: { type: 'string' },
    out: { type: 'string' },
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

const out = path.resolve(values.out ?? path.join('cv-out', `${cv.fileName}${values.template ? `-${cv.template}` : ''}.pdf`));
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, await renderCvPdf(cv));
console.log(`Wrote ${path.relative(process.cwd(), out)} (${cv.template} template)`);
