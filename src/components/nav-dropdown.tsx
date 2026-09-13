'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import type { NavGroup } from '@/lib/nav';

const CLOSE_DELAY_MS = 120;

/** Opens on hover for mouse users and on click or keyboard for everyone else. */
export function NavDropdown({ label, items, footer }: NavGroup) {
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
      className="relative"
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
          // A click right after hovering open should keep the menu open instead of toggling it shut.
          if (openedByHover.current) {
            openedByHover.current = false;
            return;
          }
          setOpen((value) => !value);
        }}
        className={cn(
          'flex h-9 items-center gap-1 rounded-md px-3 text-sm transition-colors',
          open ? 'text-fg' : 'text-fg-muted hover:text-fg',
        )}
      >
        {label}
        <ChevronDown aria-hidden className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <div id={panelId} hidden={!open} className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
        <div className="w-80 animate-dropdown rounded-xl border bg-surface p-1.5 shadow-xl shadow-black/5 dark:shadow-black/40">
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-muted"
                >
                  <span className="block text-sm font-medium text-fg">{item.label}</span>
                  {item.description && (
                    <span className="mt-0.5 line-clamp-1 block text-[13px] text-fg-muted">{item.description}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          {footer && (
            <div className="mt-1.5 border-t pt-1.5">
              <Link
                href={footer.href}
                onClick={close}
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
              >
                {footer.label}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
