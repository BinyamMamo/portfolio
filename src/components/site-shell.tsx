import type { ReactNode } from 'react';

import { BackgroundCanvas } from '@/components/background-canvas';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

/** Chrome shared by every public page: animated background, header, main landmark and footer. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <BackgroundCanvas />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-sm focus:text-bg"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
