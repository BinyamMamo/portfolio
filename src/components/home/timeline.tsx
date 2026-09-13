import { ArrowRight } from 'lucide-react';

import { TechList } from '@/components/tech-list';
import type { TimelineEntry } from '@/content/career';

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="border-t">
      {entries.map((entry) => (
        <li
          key={`${entry.org}-${entry.title}`}
          className="grid gap-3 border-b py-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8"
        >
          <p className="flex items-center gap-2 self-start font-mono text-xs text-fg-subtle md:pt-1.5">
            <span>{entry.start}</span>
            {entry.end && (
              <>
                <ArrowRight aria-hidden className="size-3" />
                <span className="sr-only">to</span>
                <span>{entry.end}</span>
              </>
            )}
          </p>
          <div>
            <h3 className="text-lg font-medium text-fg">{entry.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              {entry.orgUrl ? (
                <a
                  href={entry.orgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-fg"
                >
                  {entry.org}
                </a>
              ) : (
                entry.org
              )}
            </p>
            {entry.points.length > 0 && (
              <ul className="mt-4 list-rule space-y-2 text-[15px] leading-relaxed text-fg-muted">
                {entry.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
            {entry.details && (
              <p className="mt-4 text-sm leading-relaxed text-fg-subtle">
                <span className="text-fg-muted">{entry.details.label}:</span> {entry.details.items.join(', ')}
              </p>
            )}
            {entry.stack && <TechList ids={entry.stack} className="mt-5" />}
          </div>
        </li>
      ))}
    </ol>
  );
}
