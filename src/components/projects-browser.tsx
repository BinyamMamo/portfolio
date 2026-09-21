'use client';

import { Search } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

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

  // Read after mount rather than during render: the server has no query string, so a
  // link such as /projects?q=PyTorch would otherwise not match the first client render.
  /* eslint-disable react-hooks/set-state-in-effect -- the query string is only known on the
     client, and reading it during render would not match the server-rendered HTML. */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setQuery(q);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Keep the address bar in step, so a filtered view can be shared or reloaded.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  }, [query]);

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

        {/* -mb-px drops the field's underline onto the row's own line, level with the tabs. */}
        <label className="relative block sm:-mb-px sm:w-64 sm:shrink-0">
          <span className="sr-only">Search projects</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or technology"
            className="h-11 w-full rounded-none border-0 border-b border-transparent bg-transparent pr-3 pl-7 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-fg"
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
