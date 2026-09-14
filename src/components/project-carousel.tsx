'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { type ReactNode, useEffect, useState } from 'react';

import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/cn';

export interface CarouselSlide {
  key: string;
  caption: string;
  /** Image or video poster shown in the thumbnail strip. */
  thumbnail: string;
  /** Server-rendered media for the slide. */
  media: ReactNode;
}

const pad = (value: number) => String(value).padStart(2, '0');

export function ProjectCarousel({ slides, label, className }: { slides: CarouselSlide[]; label: string; className?: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const update = () => setCurrent(api.selectedScrollSnap());
    api.on('select', update).on('reInit', update);
    return () => {
      api.off('select', update).off('reInit', update);
    };
  }, [api]);

  const slide = slides[current];

  return (
    <section aria-label={`${label} screenshots`} className={className}>
      <Carousel setApi={setApi} opts={{ loop: slides.length > 2 }} className="overflow-hidden rounded-card border bg-surface-muted">
        <CarouselContent className="ml-0">
          {slides.map((item, index) => (
            <CarouselItem key={item.key} className="pl-0" aria-label={`${index + 1} of ${slides.length}`}>
              {item.media}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex items-start justify-between gap-6">
        <p className="text-sm leading-relaxed text-fg-muted" aria-live="polite">
          <span className="mr-3 font-mono text-xs text-fg-subtle">
            {pad(current + 1)} / {pad(slides.length)}
          </span>
          {slide?.caption}
        </p>
        <div className="-mt-1.5 flex shrink-0 items-center gap-1">
          <button type="button" className="icon-btn" onClick={() => api?.scrollPrev()} aria-label="Previous screenshot">
            <ArrowLeft aria-hidden />
          </button>
          <button type="button" className="icon-btn" onClick={() => api?.scrollNext()} aria-label="Next screenshot">
            <ArrowRight aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
        {slides.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onClick={() => api?.scrollTo(index)}
            aria-label={`Show ${item.caption || `screenshot ${index + 1}`}`}
            aria-current={index === current}
            className={cn(
              'relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-control border transition sm:w-32',
              index === current ? 'border-fg' : 'opacity-50 hover:opacity-80',
            )}
          >
            <Image src={item.thumbnail} alt="" fill sizes="128px" className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
