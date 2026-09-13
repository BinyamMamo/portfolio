'use client';

import { ArrowRight, ChevronDown, FileText, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { Logo } from '@/components/logo';
import { cn } from '@/lib/cn';
import type { NavIcon, NavLink, NavMega } from '@/lib/nav';

const CLOSE_DELAY_MS = 120;

const icons: Record<NavIcon, typeof Mail> = { mail: Mail, file: FileText };

function MenuItem({ item, onNavigate }: { item: NavLink; onNavigate: () => void }) {
  const Icon = item.icon ? icons[item.icon] : null;
  const className = cn(
    '-mx-3 flex gap-3 rounded-control px-3 transition-colors hover:bg-surface-muted',
    item.description ? 'py-2' : 'items-center py-1.5',
  );
  const content = (
    <>
      {(item.logo || Icon) && (
        <span className={cn('flex size-4 shrink-0 items-center justify-center text-fg-muted', item.description && 'mt-0.5')}>
          {item.logo ? <Logo logo={item.logo} size={16} /> : Icon && <Icon aria-hidden className="size-4" />}
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-fg">{item.label}</span>
        {item.description && (
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-fg-muted">{item.description}</span>
        )}
      </span>
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" onClick={onNavigate} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
}

/**
 * A full-width panel anchored to the header. The root is intentionally not positioned,
 * so the panel's `absolute inset-x-0` resolves against the sticky header.
 * Opens on hover for mouse users and on click or keyboard for everyone else.
 */
export function MegaMenu({ label, groups, featured, footer }: NavMega) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const openedByHover = useRef(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const close = () => {
    openedByHover.current = false;
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      // The header reads this to turn opaque while the panel is open.
      data-open={open}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return;
        window.clearTimeout(closeTimer.current);
        if (!open) openedByHover.current = true;
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return;
        closeTimer.current = window.setTimeout(close, CLOSE_DELAY_MS);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          // A click right after hovering open should keep the panel open instead of toggling it shut.
          if (openedByHover.current) {
            openedByHover.current = false;
            return;
          }
          setOpen((value) => !value);
        }}
        className="nav-link gap-1"
      >
        {label}
        <ChevronDown aria-hidden className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b bg-bg shadow-2xl shadow-black/5 dark:shadow-black/60"
      >
        <div
          className={cn(
            'page-container grid animate-dropdown gap-10 py-8',
            featured && 'lg:grid-cols-[minmax(0,1fr)_17rem]',
          )}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-8">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="eyebrow">{group.title}</p>
                <ul className="mt-4 space-y-0.5">
                  {group.items.map((item) => (
                    <li key={`${item.label}-${item.href}`}>
                      <MenuItem item={item} onNavigate={close} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {featured && (
            <Link href={featured.href} onClick={close} className="group hidden lg:block">
              <span className="relative block aspect-video overflow-hidden rounded-control border bg-surface-muted">
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  sizes="272px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <span className="eyebrow mt-4 block [--eyebrow-color:var(--accent)]">{featured.eyebrow}</span>
              <span className="mt-2 block text-sm font-medium text-fg">{featured.label}</span>
              <span className="mt-1 block text-[13px] leading-snug text-fg-muted">{featured.description}</span>
            </Link>
          )}
        </div>

        <div className="border-t">
          <div className="page-container flex items-center justify-between gap-6 py-4 text-sm">
            {footer.description && <span className="text-fg-muted">{footer.description}</span>}
            <Link
              href={footer.href}
              onClick={close}
              className="group ml-auto inline-flex items-center gap-1.5 font-medium text-fg transition-colors hover:text-accent"
            >
              {footer.label}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
