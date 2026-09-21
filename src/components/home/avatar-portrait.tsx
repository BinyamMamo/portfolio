'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { AvatarStage } from '@/components/home/avatar-stage';
import { cn } from '@/lib/cn';

const GALLERY_URL = 'https://avatars-gallery.vercel.app';

/**
 * The live avatar. The drawn still shows first, then steps aside once the canvas has drawn a frame,
 * so there is never an empty panel. A quiet credit links to where avatars like this are made.
 */
export function AvatarPortrait({ src, alt }: { src: string; alt: string }) {
  const [live, setLive] = useState(false);

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-panel bg-[#11111157]">
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        preload
        sizes="(min-width: 1024px) 304px, (min-width: 768px) 256px, 160px"
        // The still is a transparent cutout, and the optimizer flattens its alpha to black.
        unoptimized
        className={cn('object-cover transition-opacity duration-500', live && 'opacity-0')}
      />
      <AvatarStage label={alt} onReady={() => setLive(true)} className="absolute inset-0 size-full" />
      <a
        href={GALLERY_URL}
        target="_blank"
        rel="noopener"
        className="absolute right-2.5 bottom-2 inline-flex items-center gap-0.5 font-mono text-[10px] tracking-wide text-white/40 transition-colors hover:text-white/80"
      >
        make your own
        <ArrowUpRight aria-hidden className="size-3" />
      </a>
    </div>
  );
}
