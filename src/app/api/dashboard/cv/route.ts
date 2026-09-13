import { z } from 'zod';

import { getResolvedCv } from '@/cv/load';
import { renderCvPdf } from '@/cv/render';
import { cvTemplateIds } from '@/lib/schemas';
import { guardApiRequest } from '@/server/auth';

const querySchema = z.object({
  template: z.enum(cvTemplateIds).optional(),
  variant: z.string().optional(),
  download: z.string().optional(),
});

/** Renders the default CV or a tailored version. `?download` sends it as an attachment. */
export async function GET(request: Request) {
  const denied = await guardApiRequest();
  if (denied) return denied;

  const query = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) return Response.json({ error: 'Unknown template' }, { status: 400 });

  const { template, variant, download } = query.data;
  const cv = await getResolvedCv({ template, variant: variant || undefined });
  if (!cv) return Response.json({ error: 'CV version not found' }, { status: 404 });

  const pdf = await renderCvPdf(cv);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download === undefined ? 'inline' : 'attachment'}; filename="${cv.fileName}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
