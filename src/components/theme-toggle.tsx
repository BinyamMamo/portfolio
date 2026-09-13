'use client';

import { Moon, Sun } from 'lucide-react';

import { applyTheme } from '@/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      className={className}
      onClick={() => {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
      }}
    >
      {/* Icons follow the theme class, so no client state or hydration check is needed. */}
      <Sun className="size-[18px] dark:hidden" />
      <Moon className="hidden size-[18px] dark:block" />
    </button>
  );
}
