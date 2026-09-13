import path from 'node:path';

import { Font, renderToBuffer } from '@react-pdf/renderer';

import type { ResolvedCv } from '@/cv/resolve';
import { cvTemplates } from '@/cv/templates';

let fontsRegistered = false;

function registerFonts(): void {
  if (fontsRegistered) return;
  const fontDir = path.join(process.cwd(), 'src', 'cv', 'fonts');
  const font = (file: string) => path.join(fontDir, file);

  Font.register({
    family: 'Geist',
    fonts: [
      { src: font('Geist-Regular.ttf'), fontWeight: 400 },
      { src: font('Geist-Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
      { src: font('Geist-Medium.ttf'), fontWeight: 500 },
      { src: font('Geist-SemiBold.ttf'), fontWeight: 600 },
      { src: font('Geist-Bold.ttf'), fontWeight: 700 },
    ],
  });
  Font.register({ family: 'Geist Mono', src: font('GeistMono-Regular.ttf') });
  // Keep words whole; hyphenated words read badly on a CV and confuse ATS parsers.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

export async function renderCvPdf(cv: ResolvedCv): Promise<Buffer> {
  registerFonts();
  // Templates use no hooks, so calling them directly yields the <Document> element react-pdf expects.
  return renderToBuffer(cvTemplates[cv.template]({ cv }));
}
