'use client';

import { Search } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import { cn } from '@/lib/cn';

export interface BrowserItem {
  slug: string;
  /** Tab ids this project appears under, such as area ids or `client`. */
  groups: string[];
  /** Lowercased text matched against the search query. */
  keywords: string;
  /** Server-rendered card. */
  card: ReactNode;
}

export interface BrowserTab {
  id: string;
  label: string;
}

const ALL = 'all';

export function ProjectsBrowser({ items, tabs: groupTabs }: { items: BrowserItem[]; tabs: readonly BrowserTab[] }) {
  const [group, setGroup] = useState(ALL);
  const [query, setQuery] = useState('');

  const tabs = useMemo(
    () =>
      [{ id: ALL, label: 'All' }, ...groupTabs]
        .map((tab) => ({
          ...tab,
          count: tab.id === ALL ? items.length : items.filter((item) => item.groups.includes(tab.id)).length,
        }))
        .filter((tab) => tab.count > 0),
    [items, groupTabs],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) => (group === ALL || item.groups.includes(group)) && (!needle || item.keywords.includes(needle)),
    );
  }, [items, group, query]);

  return (
    <div className="mt-12">
      <div className="flex flex-col-reverse gap-4 border-b sm:flex-row sm:items-end sm:justify-between">
        <div className="-mb-px flex gap-6 overflow-x-auto" role="group" aria-label="Filter by area">
          {tabs.map((tab) => {
            const active = tab.id === group;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 border-b py-3 text-sm whitespace-nowrap transition-colors',
                  active ? 'border-fg text-fg' : 'border-transparent text-fg-muted hover:text-fg',
                )}
              >
                {tab.label}
                <span className="font-mono text-xs text-fg-subtle">{tab.count}</span>
              </button>
            );
          })}
        </div>

        <label className="relative block sm:mb-2.5 sm:w-64 sm:shrink-0">
          <span className="sr-only">Search projects</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or technology"
            className="h-10 w-full rounded-control border border-border/60 bg-surface/40 pr-3 pl-9 text-sm text-fg outline-none backdrop-blur-sm transition-colors placeholder:text-fg-subtle focus:border-border-strong focus:bg-surface/60"
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
              setGroup(ALL);
            }}
            className="link-underline mt-4 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
