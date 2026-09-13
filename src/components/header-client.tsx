'use client';

import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { Logo } from '@/components/logo';
import { NavDropdown } from '@/components/nav-dropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/cn';
import { isNavGroup, type NavEntry } from '@/lib/nav';
import type { LogoSource } from '@/lib/tech';

interface HeaderClientProps {
  name: string;
  nav: NavEntry[];
  resumeHref: string;
  github: { href: string; logo: LogoSource };
}

const iconButton =
  'flex size-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg';

function subscribeToScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

export function HeaderClient({ name, nav, resumeHref, github }: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 8,
    () => false,
  );

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 768px)');
    const onBreakpoint = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-200',
          scrolled || menuOpen ? 'border-border bg-bg/85' : 'border-transparent bg-bg/0',
        )}
      >
        <div className="page-container flex h-16 items-center justify-between gap-6">
          <Link href="/" onClick={closeMenu} className="text-[15px] font-semibold tracking-tight text-fg">
            {name}
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
            {nav.map((entry) =>
              isNavGroup(entry) ? (
                <NavDropdown key={entry.label} {...entry} />
              ) : (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="flex h-9 items-center rounded-md px-3 text-sm text-fg-muted transition-colors hover:text-fg"
                >
                  {entry.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-1">
            <a href={github.href} target="_blank" rel="noreferrer" aria-label="GitHub profile" className={iconButton}>
              <Logo logo={github.logo} size={18} />
            </a>
            <ThemeToggle className={iconButton} />
            <a
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
              className="ml-2 hidden h-9 items-center rounded-lg bg-fg px-3.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 md:inline-flex"
            >
              Resume
            </a>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((value) => !value)}
              className={cn(iconButton, 'md:hidden')}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Kept outside <header>: its backdrop-filter would otherwise trap this fixed panel. */}
      <div id="mobile-menu" hidden={!menuOpen} className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-bg md:hidden">
        <nav aria-label="Mobile" className="page-container flex flex-col gap-10 py-8">
          {nav.map((entry) =>
            isNavGroup(entry) ? (
              <div key={entry.label}>
                <p className="font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">{entry.label}</p>
                <ul className="mt-3 divide-y border-y">
                  {[...entry.items, ...(entry.footer ? [entry.footer] : [])].map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} onClick={closeMenu} className="flex items-center justify-between py-3.5 text-fg">
                        {item.label}
                        <ArrowRight aria-hidden className="size-4 text-fg-subtle" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={closeMenu}
                className="flex items-center justify-between border-y py-3.5 text-fg"
              >
                {entry.label}
                <ArrowRight aria-hidden className="size-4 text-fg-subtle" />
              </Link>
            ),
          )}
          <a
            href={resumeHref}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center rounded-lg bg-fg text-sm font-medium text-bg"
          >
            Resume
          </a>
        </nav>
      </div>
    </>
  );
}
