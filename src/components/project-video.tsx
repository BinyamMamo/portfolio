'use client';

import { useEffect, useRef } from 'react';

interface ProjectVideoProps {
  src: string;
  poster: string;
  label: string;
  /**
   * `hover`: plays while the pointer is over the closest `[data-hover-play]` ancestor.
   * `in-view`: plays while the video is on screen.
   */
  trigger: 'hover' | 'in-view';
  className?: string;
}

/** A silent looping demo clip. Stays on its poster frame for users who prefer reduced motion. */
export function ProjectVideo({ src, poster, label, trigger, className }: ProjectVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const play = () => {
      // play() rejects if the browser blocks it or the element is removed mid-load; the poster remains visible.
      video.play().catch(() => {});
    };
    const pause = () => video.pause();

    if (trigger === 'hover') {
      const host = video.closest<HTMLElement>('[data-hover-play]') ?? video;
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType === 'mouse') play();
      };
      host.addEventListener('pointerenter', onEnter);
      host.addEventListener('pointerleave', pause);
      return () => {
        host.removeEventListener('pointerenter', onEnter);
        host.removeEventListener('pointerleave', pause);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [trigger]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      // Nothing downloads until the clip is played, so off-screen and unhovered videos cost only their poster.
      preload="none"
      className={className}
    />
  );
}
