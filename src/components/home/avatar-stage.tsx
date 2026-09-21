'use client';

import { useEffect, useRef } from 'react';

import detailMesh from '@/avatar/detail-mesh.json';
import personaData from '@/avatar/persona.json';
import type { Persona } from '@/avatar/persona/persona';
import { createAvatarStage, type DetailMesh } from '@/avatar/stage';

const persona = personaData as unknown as Persona;
const DETAIL_TEXTURE = '/media/avatar-detail.webp';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
/** Frame-rate independent easing towards a target. */
const approach = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));
const between = (min: number, max: number) => min + Math.random() * (max - min);

/** A blink: closed fast, opened a little slower. Returns how open the eyes are, 0 to 1. */
function blinkAmount(elapsed: number): number {
  if (elapsed < 0.08) return 1 - elapsed / 0.08;
  if (elapsed < 0.13) return 0;
  if (elapsed < 0.27) return (elapsed - 0.13) / 0.14;
  return 1;
}

/** Eases a gesture in and out so it never starts or stops abruptly. */
const envelope = (progress: number) => Math.sin(Math.PI * clamp(progress, 0, 1)) ** 2;

interface AvatarStageProps {
  label: string;
  className?: string;
  /** Called once the first frame is on screen, so a placeholder can step aside. */
  onReady?: () => void;
}

export function AvatarStage({ label, className, onReady }: AvatarStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef(onReady);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    const texture = new Image();
    texture.src = DETAIL_TEXTURE;
    texture
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (disposed) return;
        const detail = texture.naturalWidth > 0 ? { image: texture, mesh: detailMesh as DetailMesh } : undefined;
        const stage = createAvatarStage(canvas, persona, detail);
        if (!stage) return;
        start(stage);
      });

    function start(stage: NonNullable<ReturnType<typeof createAvatarStage>>) {
      if (!canvas) return;
      const { rig } = stage;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const size = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        if (reduced) stage.render(0.016);
      };
      size();
      const resizeObserver = new ResizeObserver(size);
      resizeObserver.observe(canvas);
      cleanups.push(() => resizeObserver.disconnect());

      // Where the pointer is, in roughly -1..1 around the face, and when it last moved.
      let pointerX = 0;
      let pointerY = 0;
      let pointerAt = -10;
      let time = 0;
      const onPointerMove = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointerX = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width * 1.4), -1, 1);
        pointerY = clamp((event.clientY - (rect.top + rect.height * 0.42)) / (rect.height * 1.3), -1, 1);
        pointerAt = time;
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      cleanups.push(() => window.removeEventListener('pointermove', onPointerMove));

      let gazeX = 0;
      let gazeY = 0;
      let headX = 0;
      let headY = 0;
      // Now and then the head settles into a slightly different angle, like someone shifting in a chair.
      let restX = 0;
      let restY = 0;
      let restAt = between(4, 8);
      let blinkAt = between(1.2, 3);
      let blinkStart = -1;
      let blinksLeft = 0;
      let gestureAt = between(14, 26);
      let gestureStart = -1;
      let gestureKind: 'shake' | 'nod' = 'shake';

      const frame = (dt: number) => {
        time += dt;
        const following = time - pointerAt < 4;
        // Eyes follow the pointer; with nothing to follow they drift back toward the viewer.
        const lookX = following ? pointerX : restX * 0.6;
        const lookY = following ? pointerY : restY * 0.6;
        gazeX = approach(gazeX, lookX, 9, dt);
        gazeY = approach(gazeY, lookY, 9, dt);

        if (time >= restAt) {
          restX = between(-0.25, 0.25);
          restY = between(-0.12, 0.12);
          restAt = time + between(5, 11);
        }
        // The head follows the eyes part of the way, and more slowly.
        headX = approach(headX, gazeX * 0.35 + restX * 0.5, 2.2, dt);
        headY = approach(headY, gazeY * 0.22 + restY * 0.5, 2.2, dt);

        rig.gazeX = gazeX;
        rig.gazeY = gazeY * 0.8;
        rig.headYaw = headX;
        rig.headPitch = headY;
        rig.headRoll = -headX * 0.08;
        rig.breath = (Math.sin(time * 0.62) + 1) / 2;
        rig.mouthForm = 0.15;

        if (blinkStart < 0 && time >= blinkAt) {
          blinkStart = time;
          blinksLeft = Math.random() < 0.18 ? 1 : 0;
        }
        if (blinkStart >= 0) {
          const open = blinkAmount(time - blinkStart);
          rig.eyeOpenL = open;
          rig.eyeOpenR = open;
          if (time - blinkStart > 0.27) {
            blinkStart = -1;
            if (blinksLeft > 0) {
              blinksLeft -= 1;
              blinkAt = time + 0.1;
            } else {
              blinkAt = time + between(2.8, 7);
            }
          }
        } else {
          rig.eyeOpenL = 1;
          rig.eyeOpenR = 1;
        }

        if (gestureStart < 0 && time >= gestureAt) {
          gestureStart = time;
          gestureKind = Math.random() < 0.55 ? 'shake' : 'nod';
        }
        if (gestureStart >= 0) {
          const progress = (time - gestureStart) / 1.1;
          if (progress >= 1) {
            gestureStart = -1;
            gestureAt = time + between(18, 40);
          } else if (gestureKind === 'shake') {
            rig.headYaw = clamp(rig.headYaw + 0.16 * Math.sin(progress * Math.PI * 4) * envelope(progress), -1, 1);
          } else {
            rig.headPitch = clamp(rig.headPitch + 0.12 * Math.sin(progress * Math.PI * 3) * envelope(progress), -1, 1);
          }
        }

        stage.render(dt);
      };

      if (reduced) {
        stage.render(0.016);
        readyRef.current?.();
        return;
      }

      let raf = 0;
      let last = performance.now();
      let visible = true;
      let announced = false;
      const loop = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        frame(dt);
        if (!announced) {
          announced = true;
          readyRef.current?.();
        }
        raf = requestAnimationFrame(loop);
      };
      const run = () => {
        if (raf) return;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      };
      const stop = () => {
        cancelAnimationFrame(raf);
        raf = 0;
      };
      // Nothing runs while the avatar is off screen or the tab is in the background.
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible && !document.hidden) run();
        else stop();
      });
      intersection.observe(canvas);
      const onVisibility = () => {
        if (!document.hidden && visible) run();
        else stop();
      };
      document.addEventListener('visibilitychange', onVisibility);
      run();
      cleanups.push(() => {
        stop();
        intersection.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
      });
    }

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
}
