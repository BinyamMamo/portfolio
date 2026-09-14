'use client';

import { ArrowUpRight, Play } from 'lucide-react';
import { useState } from 'react';

interface DemoFrameProps {
  url: string;
  label: string;
  title: string;
}

/** An embedded live demo. Nothing loads until the visitor asks for it. */
export function DemoFrame({ url, label, title }: DemoFrameProps) {
  const [active, setActive] = useState(false);
  const host = URL.canParse(url) ? new URL(url).hostname : url;

  return (
    <div className="overflow-hidden rounded-card border bg-surface-muted">
      {active ? (
        <iframe
          src={url}
          title={title}
          allow="fullscreen; accelerometer; gyroscope"
          className="block aspect-[16/10] w-full bg-black"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group flex aspect-[16/10] w-full flex-col items-center justify-center gap-4 text-fg-muted transition-colors hover:text-fg"
        >
          <span className="flex size-14 items-center justify-center rounded-full border border-border-strong transition-colors group-hover:border-fg">
            <Play aria-hidden className="size-5 translate-x-0.5" />
          </span>
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-fg-subtle">Loads an interactive demo from {host}</span>
        </button>
      )}
      <div className="flex items-center justify-between gap-4 border-t px-4 py-3 text-sm">
        <span className="truncate text-fg-muted">{title}</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-fg-muted transition-colors hover:text-fg"
        >
          Open in a new tab
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
      </div>
    </div>
  );
}
