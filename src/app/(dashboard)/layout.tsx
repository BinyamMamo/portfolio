import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
