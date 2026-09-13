'use client';

import { Search } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import { cn } from '@/lib/cn';

export interface BrowserItem {
  slug: string;
  category: string;
  /** Lowercased text matched against the search query. */
  keywords: string;
  /** Server-rendered card. */
  card: ReactNode;
}

const ALL = 'All';

export function ProjectsBrowser({ items, categories }: { items: BrowserItem[]; categories: readonly string[] }) {
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');

  const tabs = useMemo(
    () =>
      [ALL, ...categories]
        .map((name) => ({
          name,
          count: name === ALL ? items.length : items.filter((item) => item.category === name).length,
        }))
        .filter((tab) => tab.count > 0),
    [items, categories],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) => (category === ALL || item.category === category) && (!needle || item.keywords.includes(needle)),
    );
  }, [items, category, query]);

  return (
    <div className="mt-12">
      <div className="flex flex-col-reverse gap-4 border-b sm:flex-row sm:items-end sm:justify-between">
        <div className="-mb-px flex gap-6 overflow-x-auto" role="group" aria-label="Filter by category">
          {tabs.map((tab) => {
            const active = tab.name === category;
            return (
              <button
                key={tab.name}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(tab.name)}
                className={cn(
                  'flex items-center gap-1.5 border-b py-3 text-sm whitespace-nowrap transition-colors',
                  active ? 'border-fg text-fg' : 'border-transparent text-fg-muted hover:text-fg',
                )}
              >
                {tab.name}
                <span className="font-mono text-xs text-fg-subtle">{tab.count}</span>
              </button>
            );
          })}
        </div>

        <label className="relative block sm:mb-2.5 sm:w-64">
          <span className="sr-only">Search projects</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or technology"
            className="h-10 w-full rounded-lg border bg-surface pr-3 pl-9 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-border-strong"
          />
        </label>
      </div>

      {visible.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.slug}>{item.card}</li>
          ))}
        </ul>
      ) : (
        <div className="py-24 text-center">
          <p className="text-fg-muted">No projects match your search.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory(ALL);
            }}
            className="mt-4 text-sm text-fg underline decoration-border-strong underline-offset-4 hover:decoration-fg"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
