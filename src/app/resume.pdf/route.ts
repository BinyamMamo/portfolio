import { getResolvedCv } from '@/cv/load';
import { renderCvPdf } from '@/cv/render';

// Rendered once at build time from the committed content, so the live site serves a static file.
export const dynamic = 'force-static';

export async function GET() {
  const cv = await getResolvedCv();
  if (!cv) return new Response('Not found', { status: 404 });

  const pdf = await renderCvPdf(cv);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${cv.fileName}.pdf"`,
    },
  });
}
