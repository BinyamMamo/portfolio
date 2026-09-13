import { guardApiRequest } from '@/server/auth';
import { MediaError, processMedia } from '@/server/media-store';

/** Accepts one file per request (multipart field "file") and stores an optimized copy under public/. */
export async function POST(request: Request) {
  const denied = await guardApiRequest();
  if (denied) return denied;

  const form = await request.formData();
  const file = form.get('file');
  const folder = form.get('folder');
  const alt = form.get('alt');

  if (!(file instanceof File) || typeof folder !== 'string') {
    return Response.json({ error: 'Send a file and a destination folder.' }, { status: 400 });
  }

  try {
    const media = await processMedia({
      data: Buffer.from(await file.arrayBuffer()),
      fileName: file.name,
      mimeType: file.type,
      folder,
      alt: typeof alt === 'string' ? alt : '',
    });
    return Response.json(media);
  } catch (error) {
    if (error instanceof MediaError) return Response.json({ error: error.message }, { status: 400 });
    throw error;
  }
}
