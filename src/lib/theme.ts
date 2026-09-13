export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/** Keep in sync with the html.theme-transition rule in globals.css. */
const THEME_FADE_MS = 300;

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * Dark is the default when nothing has been stored yet.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();`;

let fadeTimer: number | undefined;

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition');
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(() => root.classList.remove('theme-transition'), THEME_FADE_MS + 50);
  }

  root.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The toggle still works for this visit.
  }
}
