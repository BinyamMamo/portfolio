'use client';

import { ExternalLink, Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { activeNavItem } from '@/components/dashboard/nav-items';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { applyTheme } from '@/lib/theme';

export function DashboardHeader() {
  const pathname = usePathname();
  const title = activeNavItem(pathname).title;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <h1 className="text-sm font-medium">{title}</h1>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" asChild>
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink />
            View site
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle color theme"
          onClick={() => applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')}
        >
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </div>
    </header>
  );
}
