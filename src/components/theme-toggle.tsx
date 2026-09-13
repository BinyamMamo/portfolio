'use client';

import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/cn';
import { applyTheme } from '@/lib/theme';

const icon = 'absolute size-[18px] transition-[rotate,scale,opacity] duration-300 ease-out';

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      className={cn('relative', className)}
      onClick={() => {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
      }}
    >
      {/* Both icons stay mounted and cross-fade with a quarter turn, driven by the theme class. */}
      <Sun aria-hidden className={cn(icon, 'dark:scale-50 dark:rotate-90 dark:opacity-0')} />
      <Moon aria-hidden className={cn(icon, 'scale-50 -rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100')} />
    </button>
  );
}
