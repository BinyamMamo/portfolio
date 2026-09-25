/**
 * Where generated CV files land.
 *
 * Everything under cv-out/ is gitignored and disposable. The PDF the site serves is rendered from
 * content at deploy time by src/app/resume.pdf/route.ts, so nothing here is a source of truth:
 * delete the whole tree and `pnpm cv:pdf` rebuilds it.
 */
import path from 'node:path';

export const CV_OUT_DIR = 'cv-out';

/** Rendered PDFs, one per template or variant. */
export const CV_PDF_DIR = path.join(CV_OUT_DIR, 'pdf');

/** Page images, for looking at a layout rather than reading the text. */
export const CV_PREVIEW_DIR = path.join(CV_OUT_DIR, 'preview');
