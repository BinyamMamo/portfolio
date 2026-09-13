import { ArrowLeft } from 'lucide-react';

import { ButtonLink } from '@/components/button-link';
import { Eyebrow } from '@/components/section';

export default function NotFound() {
  return (
    <div className="page-container flex min-h-[60vh] flex-col items-start justify-center py-24">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-fg-muted">The page you are looking for does not exist or has moved.</p>
      <ButtonLink href="/" className="mt-8">
        <ArrowLeft aria-hidden />
        Back home
      </ButtonLink>
    </div>
  );
}
