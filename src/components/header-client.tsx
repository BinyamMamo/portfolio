'use client';

import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { Logo } from '@/components/logo';
import { MegaMenu } from '@/components/mega-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/cn';
import { isNavMega, type NavEntry, type NavLink } from '@/lib/nav';
import type { LogoSource } from '@/lib/tech';

interface HeaderClientProps {
  nav: NavEntry[];
  resumeHref: string;
  github: { href: string; logo: LogoSource };
}

function subscribeToScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

function MobileRow({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  return (
    <li>
      <Link href={link.href} onClick={onNavigate} className="flex items-center justify-between py-3.5 text-fg">
        {link.label}
        <ArrowRight aria-hidden className="size-4 text-fg-subtle" />
      </Link>
    </li>
  );
}

export function HeaderClient({ nav, resumeHref, github }: HeaderClientProps) {
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
  const megaMenus = nav.filter(isNavMega);
  const plainLinks = nav.filter((entry): entry is NavLink => !isNavMega(entry));

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-200',
          scrolled || menuOpen ? 'border-border bg-bg/80' : 'border-transparent bg-bg/0',
          'has-[[data-open=true]]:border-border has-[[data-open=true]]:bg-bg',
        )}
      >
        <div className="page-container flex h-header items-center justify-between gap-6">
          <div className="flex items-center">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((value) => !value)}
              className="icon-btn -ml-2 md:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* Negative margin lines the first label up with the page content. */}
            <nav aria-label="Main" className="-ml-3 hidden items-center md:flex">
              {nav.map((entry) =>
                isNavMega(entry) ? (
                  <MegaMenu key={entry.label} {...entry} />
                ) : (
                  <Link key={entry.href} href={entry.href} className="nav-link">
                    {entry.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <a href={github.href} target="_blank" rel="noreferrer" aria-label="GitHub profile" className="icon-btn">
              <Logo logo={github.logo} size={18} />
            </a>
            <ThemeToggle className="icon-btn" />
            <div className="ml-2 hidden md:block">
              <a href={resumeHref} target="_blank" rel="noreferrer" className="btn btn-primary">
                Resume
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Kept outside <header>: its backdrop-filter would otherwise trap this fixed panel. */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="fixed inset-x-0 top-header bottom-0 z-40 overflow-y-auto bg-bg md:hidden"
      >
        <nav aria-label="Mobile" className="page-container flex flex-col gap-10 py-8">
          <ul className="divide-y border-y">
            {plainLinks.map((link) => (
              <MobileRow key={link.href} link={link} onNavigate={closeMenu} />
            ))}
          </ul>

          {megaMenus.map((menu) => (
            <div key={menu.label} className="space-y-7">
              <p className="eyebrow">{menu.label}</p>
              {menu.groups.map((group) => (
                <div key={group.title}>
                  <p className="text-xs text-fg-subtle">{group.title}</p>
                  <ul className="mt-2 divide-y border-y">
                    {group.items.map((item) => (
                      <MobileRow key={item.href} link={item} onNavigate={closeMenu} />
                    ))}
                  </ul>
                </div>
              ))}
              <ul className="divide-y border-y">
                <MobileRow link={menu.footer} onNavigate={closeMenu} />
              </ul>
            </div>
          ))}

          <a href={resumeHref} target="_blank" rel="noreferrer" className="btn btn-primary">
            Resume
          </a>
        </nav>
      </div>
    </>
  );
}
