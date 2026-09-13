import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('eyebrow', className)}>{children}</p>;
}

/** "01 / Work" style label used above section titles. */
export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <Eyebrow>
      <span className="text-brand">{index}</span>
      <span aria-hidden className="mx-2 text-border-strong">
        /
      </span>
      {label}
    </Eyebrow>
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
            <SectionLabel index={index} label={label} />
            <h2 id={`${id}-title`} className="heading mt-4 text-3xl sm:text-4xl">
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
