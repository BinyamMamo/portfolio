/**
 * Checks that a rendered CV survives the machines that read it before a person does.
 *
 *   pnpm cv:ats                     the default CV
 *   pnpm cv:ats --variant full --pages 2
 *
 * Applicant tracking systems parse the PDF's text layer, so this renders the real PDF, extracts that
 * layer with pdftotext, and asserts the things parsers actually trip over. Exits non-zero on problems.
 */
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { parseArgs } from 'node:util';

import { getResolvedCv } from '../src/cv/load';
import { renderCvPdf } from '../src/cv/render';

const run = promisify(execFile);

const { values } = parseArgs({
  options: {
    variant: { type: 'string' },
    pages: { type: 'string' },
  },
});

const expectedPages = values.pages ? Number(values.pages) : 1;

const cv = await getResolvedCv({ variant: values.variant });
if (!cv) {
  console.error(`No CV version named "${values.variant}" in content/cv/variants.`);
  process.exit(1);
}

const dir = await mkdtemp(path.join(tmpdir(), 'cv-ats-'));
const pdfPath = path.join(dir, `${cv.fileName}.pdf`);
await writeFile(pdfPath, await renderCvPdf(cv));

async function tool(command: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await run(command, args);
    return stdout;
  } catch (error) {
    const reason = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'is not installed' : 'failed';
    throw new Error(`${command} ${reason}. Install poppler-utils to run this check.`);
  }
}

const problems: string[] = [];
const fail = (message: string) => problems.push(message);

try {
  const info = await tool('pdfinfo', [pdfPath]);
  const pages = Number(/Pages:\s+(\d+)/.exec(info)?.[1] ?? 0);
  if (pages !== expectedPages) fail(`expected ${expectedPages} page(s), got ${pages}`);
  else console.log(`ok    ${pages} page(s)`);

  // -layout keeps the visual column order, which is what a parser reconstructs.
  const text = await tool('pdftotext', ['-layout', pdfPath, '-']);
  const flat = text.replace(/\s+/g, ' ');

  // A section a parser cannot name is a section it drops. These are the headings they map on.
  const headingFor: Partial<Record<(typeof cv.sections)[number], string>> = {
    experience: 'EXPERIENCE',
    projects: 'PROJECTS',
    skills: 'SKILLS',
    education: 'EDUCATION',
    certifications: 'CERTIFICATIONS',
  };
  // Matched on its own line, so a path such as "/projects/soroban" cannot stand in for a heading.
  const ownLines = new Set(text.split('\n').map((line) => line.trim().toUpperCase()));
  for (const id of cv.sections) {
    const heading = headingFor[id];
    if (heading && !ownLines.has(heading)) {
      fail(`section heading "${heading}" is not a line of its own in the text layer`);
    }
  }
  console.log('ok    section headings');

  // Contact details: a record without them parses as incomplete.
  if (!flat.includes(cv.email)) fail(`email "${cv.email}" is not extractable`);
  if (cv.phone && !flat.includes(cv.phone)) fail(`phone "${cv.phone}" is not extractable`);
  if (cv.location && !flat.includes(cv.location)) fail(`location "${cv.location}" is not extractable`);
  console.log('ok    contact details');

  // The name has to be the first thing on the page, or a parser may take a heading for the candidate.
  const firstLine =
    text
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? '';
  if (firstLine !== cv.name) fail(`first line of the text layer is "${firstLine}", expected "${cv.name}"`);
  else console.log('ok    reading order');

  // Dates: "Mon YYYY - Mon YYYY" or "Mon YYYY - Present". A stray "to" parses less reliably.
  const datePattern = /\b[A-Z][a-z]{2} \d{4} (?:-|to) (?:[A-Z][a-z]{2} \d{4}|Present)\b/g;
  const dates = flat.match(datePattern) ?? [];
  if (dates.length === 0) fail('no date ranges found in the text layer');
  for (const date of dates) {
    if (date.includes(' to ')) fail(`date range "${date}" uses "to"; use "-" so parsers read it reliably`);
  }
  if (dates.length > 0) console.log(`ok    ${dates.length} date range(s)`);

  // A word split across lines becomes two junk tokens. Hyphenation is off, so any of these is a bug.
  const broken = text.match(/\w-\n\s*\w/g) ?? [];
  if (broken.length > 0) fail(`${broken.length} word(s) broken across lines`);

  // Missing glyphs come through as replacement characters and poison the keywords around them.
  if (/[�]/.test(text)) fail('the text layer contains replacement characters, so a glyph failed to embed');
  if (flat.trim().length < 400) fail(`only ${flat.trim().length} characters extracted, so the text layer looks broken`);
  console.log('ok    text layer');
} catch (error) {
  fail((error as Error).message);
} finally {
  await rm(dir, { recursive: true, force: true });
}

if (problems.length > 0) {
  console.error(`\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
  process.exit(1);
}
console.log(`\n${cv.fileName}.pdf reads cleanly.`);
