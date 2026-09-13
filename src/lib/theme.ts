export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * Dark is the default when nothing has been stored yet.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();`;

/**
 * Switches the theme. Where the View Transitions API exists, the whole page cross-fades from a
 * snapshot of the old theme (duration: --theme-fade in globals.css). Fading individual colors instead
 * makes text and borders pass through muddy greys at different speeds.
 */
export function applyTheme(theme: Theme): void {
  const commit = () => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies). The toggle still works for this visit.
    }
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('startViewTransition' in document)) {
    commit();
    return;
  }

  document.startViewTransition(commit);
}
