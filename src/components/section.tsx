import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase', className)}>{children}</p>
  );
}

interface SectionProps {
  id: string;
  index: string;
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** A full-width home page section with a numbered header. */
export function Section({ id, index, label, title, description, action, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t">
      <div className="page-container py-20 sm:py-28">
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>
              <span className="text-accent">{index}</span>
              <span aria-hidden className="mx-2 text-border-strong">
                /
              </span>
              {label}
            </Eyebrow>
            <h2 id={`${id}-title`} className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              {title}
            </h2>
            {description && <p className="mt-4 text-base leading-relaxed text-fg-muted">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
