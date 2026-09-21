'use client';

import { ArrowRight, ArrowUpRight, ChevronDown, FileText, Globe, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { Logo } from '@/components/logo';
import { cn } from '@/lib/cn';
import type { NavIcon, NavLink, NavMega } from '@/lib/nav';

const CLOSE_DELAY_MS = 120;

const icons: Record<NavIcon, typeof Mail> = { mail: Mail, file: FileText, globe: Globe };

/** Headings read tighter with an ampersand. */
const heading = (title: string) => title.replace(/\band\b/g, '&');

interface MenuItemProps {
  item: NavLink;
  active: boolean;
  onNavigate: () => void;
  onPreview: (item: NavLink) => void;
}

function MenuItem({ item, active, onNavigate, onPreview }: MenuItemProps) {
  const Icon = item.icon ? icons[item.icon] : null;
  // No hover backgrounds: the title takes the brand colour, which also marks the previewed project.
  const className = cn(
    'group/item -mx-3 flex gap-3 rounded-control px-3 transition-colors',
    item.description ? 'py-2' : 'items-center py-1.5',
  );
  const preview = item.preview ? { onPointerEnter: () => onPreview(item), onFocus: () => onPreview(item) } : {};
  const content = (
    <>
      {(item.logo || Icon || !item.description) && (
        // Plain entries without a logo keep an empty slot, so every name in a column lines up.
        <span className={cn('flex size-4 shrink-0 items-center justify-center text-fg-muted', item.description && 'mt-0.5')}>
          {item.logo ? <Logo logo={item.logo} size={16} /> : Icon && <Icon aria-hidden className="size-4" />}
        </span>
      )}
      <span className="min-w-0">
        <span
          className={cn(
            'block text-sm font-medium text-fg transition-colors duration-200',
            'group-hover/item:text-brand/80 group-focus-visible/item:text-brand/80',
            active && 'text-brand/80',
          )}
        >
          {item.label}
        </span>
        {item.description && (
          <span className="mt-0.5 line-clamp-1 text-[13px] leading-snug text-fg-muted">{item.description}</span>
        )}
      </span>
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" onClick={onNavigate} className={className} {...preview}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={className} {...preview}>
      {content}
    </Link>
  );
}

interface SidePanel {
  href: string;
  image: string;
  eyebrow: string;
  label: string;
  description: string;
  /** The hovered project, rather than the menu's standing feature. */
  preview: boolean;
}

/**
 * A full-width panel anchored to the header. The root is intentionally not positioned,
 * so the panel's `absolute inset-x-0` resolves against the sticky header.
 * Opens on hover for mouse users and on click or keyboard for everyone else. Hovering a project
 * swaps the side panel for its screenshot and full summary.
 */
export function MegaMenu({ label, groups, featured, footer }: NavMega) {
  const [open, setOpen] = useState(false);
  const [previewed, setPreviewed] = useState<NavLink | null>(null);
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
    setPreviewed(null);
  };

  const hasPreviews = groups.some((group) => group.items.some((item) => item.preview));
  const panels: SidePanel[] = [];
  if (featured) panels.push({ ...featured, preview: false });
  for (const item of groups.flatMap((group) => group.items)) {
    if (!item.preview || panels.some((panel) => panel.preview && panel.href === item.href)) continue;
    panels.push({
      href: item.href,
      image: item.preview.image,
      eyebrow: item.preview.eyebrow,
      label: item.label,
      description: item.preview.summary,
      preview: true,
    });
  }
  const activeHref = previewed?.preview ? previewed.href : featured?.href;
  const activePreview = Boolean(previewed?.preview);
  const isActive = (panel: SidePanel) => panel.href === activeHref && panel.preview === activePreview;

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
        <ChevronDown aria-hidden className={cn('size-3.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {/* Kept mounted so it can fade and slide on both open and close; inert keeps it out of reach when shut. */}
      <div
        id={panelId}
        inert={!open}
        aria-hidden={!open}
        className={cn(
          'absolute inset-x-0 top-full border-b border-border/40 bg-bg/80 shadow-2xl shadow-black/5 backdrop-blur-xl transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none dark:shadow-black/50',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <div
          className={cn('page-container grid gap-10 py-8', panels.length > 0 && 'lg:grid-cols-[minmax(0,1fr)_18rem]')}
          onPointerLeave={() => setPreviewed(null)}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-8">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="eyebrow">{heading(group.title)}</p>
                <ul className="mt-4 space-y-0.5">
                  {group.items.map((item) => (
                    <li key={`${item.label}-${item.href}`}>
                      <MenuItem
                        item={item}
                        active={hasPreviews && previewed?.href === item.href}
                        onNavigate={close}
                        onPreview={setPreviewed}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {panels.length > 0 && (
            // All panels share one grid cell, so the column takes the tallest one's height and the
            // active panel crossfades over the others instead of popping in.
            <div className="hidden lg:grid">
              {panels.map((panel) => {
                const active = isActive(panel);
                return (
                  <Link
                    key={`${panel.preview ? 'preview' : 'featured'}-${panel.href}`}
                    href={panel.href}
                    onClick={close}
                    inert={!active}
                    aria-hidden={!active}
                    className={cn(
                      'group [grid-area:1/1] transition-[opacity,translate] duration-300 ease-in-out motion-reduce:transition-none',
                      active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0',
                    )}
                  >
                    <span className="relative block aspect-video overflow-hidden rounded-control border bg-surface-muted">
                      <Image
                        src={panel.image}
                        alt=""
                        fill
                        sizes="288px"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </span>
                    <span className="eyebrow mt-4 block [--eyebrow-color:var(--brand)]">{panel.eyebrow}</span>
                    <span className="mt-2 block text-sm font-medium text-fg">{panel.label}</span>
                    <span className="mt-1 line-clamp-5 text-[13px] leading-snug text-fg-muted">{panel.description}</span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg transition-colors group-hover:text-brand">
                      Details
                      <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border/40">
          <div className="page-container flex items-center justify-between gap-6 py-4 text-sm">
            {footer.description && <span className="text-fg-muted">{footer.description}</span>}
            <Link
              href={footer.href}
              onClick={close}
              className="group ml-auto inline-flex items-center gap-1.5 font-medium text-fg transition-colors hover:text-brand"
            >
              {footer.label}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
