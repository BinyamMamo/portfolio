'use client';

import { ArrowUpRight, Play } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface DemoFrameProps {
  url: string;
  label: string;
  title: string;
  /** Image shown, dimmed, behind the play button before the demo loads. */
  poster?: string;
}

/** An embedded live demo. Nothing loads until the visitor asks for it. */
export function DemoFrame({ url, label, title, poster }: DemoFrameProps) {
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
          className="group relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-4 overflow-hidden text-white"
        >
          {poster && (
            <Image
              src={poster}
              alt=""
              fill
              sizes="(min-width: 1152px) 1088px, 100vw"
              className="object-cover opacity-40 blur-[2px] transition duration-500 group-hover:scale-[1.02] group-hover:opacity-55"
            />
          )}
          <span aria-hidden className="absolute inset-0 bg-black/40" />
          <span className="relative flex size-14 items-center justify-center rounded-full border border-white/40 bg-black/30 backdrop-blur-sm transition-colors group-hover:border-white">
            <Play aria-hidden className="size-5 translate-x-0.5" />
          </span>
          <span className="relative text-sm font-medium">{label}</span>
          <span className="relative text-xs text-white/70">Loads an interactive demo from {host}</span>
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
