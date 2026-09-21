'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

const GALLERY_URL = 'https://avatars-gallery.vercel.app';

/**
 * The drawn portrait, kept as the original artwork and brought to life with motion around it:
 * it breathes, and leans a little toward the pointer. A quiet credit links to where it was made.
 */
export function AvatarPortrait({ src, alt }: { src: string; alt: string }) {
  const figureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const onPointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = figure.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width * 2)));
        const y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height * 0.4)) / (rect.height * 2)));
        figure.style.setProperty('--lean-x', `${(x * 6).toFixed(2)}px`);
        figure.style.setProperty('--lean-y', `${(y * 4).toFixed(2)}px`);
        figure.style.setProperty('--lean-r', `${(x * 1.6).toFixed(2)}deg`);
      });
    };
    const onPointerLeave = () => {
      figure.style.setProperty('--lean-x', '0px');
      figure.style.setProperty('--lean-y', '0px');
      figure.style.setProperty('--lean-r', '0deg');
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-panel bg-[#11111157]">
      <div
        ref={figureRef}
        className="absolute inset-0 translate-x-[var(--lean-x,0px)] translate-y-[var(--lean-y,0px)] rotate-[var(--lean-r,0deg)] transition-transform duration-700 ease-out motion-reduce:transition-none"
      >
        <div className="absolute inset-0 origin-bottom animate-[breathe_6s_ease-in-out_infinite] motion-reduce:animate-none">
          <Image
            src={src}
            alt={alt}
            fill
            preload
            sizes="(min-width: 1024px) 304px, (min-width: 768px) 256px, 160px"
            // The portrait is a transparent cutout, and the optimizer flattens its alpha to black.
            unoptimized
            className="object-cover"
          />
        </div>
      </div>
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
