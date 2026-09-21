'use client';

import { useEffect, useRef } from 'react';

import personaData from '@/avatar/persona.json';
import type { Persona } from '@/avatar/persona/persona';
import { createAvatarStage } from '@/avatar/stage';

const persona = personaData as unknown as Persona;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
/** Frame-rate independent easing towards a target. */
const approach = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));
const between = (min: number, max: number) => min + Math.random() * (max - min);

/** A blink: closed fast, opened a little slower. Returns how open the eyes are, 0 to 1. */
function blinkAmount(elapsed: number): number {
  if (elapsed < 0.09) return 1 - elapsed / 0.09;
  if (elapsed < 0.14) return 0;
  if (elapsed < 0.28) return (elapsed - 0.14) / 0.14;
  return 1;
}

/** Eases a gesture in and out so it never starts or stops abruptly. */
const envelope = (progress: number) => Math.sin(Math.PI * clamp(progress, 0, 1)) ** 2;

export function AvatarStage({ className, label }: { className?: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stage = createAvatarStage(canvas, persona);
    if (!stage) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const { rig } = stage;

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };
    size();
    const resizeObserver = new ResizeObserver(size);
    resizeObserver.observe(canvas);

    // Where the pointer is, in roughly -1..1 around the face.
    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width * 1.5), -1, 1);
      pointerY = clamp((event.clientY - (rect.top + rect.height * 0.42)) / (rect.height * 1.4), -1, 1);
    };
    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    let gazeX = 0;
    let gazeY = 0;
    let time = 0;
    let blinkAt = between(1.5, 4);
    let blinkStart = -1;
    let blinksLeft = 0;
    let gestureAt = between(12, 24);
    let gestureStart = -1;
    let gestureKind: 'shake' | 'nod' = 'shake';

    const frame = (dt: number) => {
      time += dt;
      gazeX = approach(gazeX, pointerX, 6, dt);
      gazeY = approach(gazeY, pointerY, 6, dt);

      // Eyes lead, the head follows a little way behind.
      rig.gazeX = gazeX;
      rig.gazeY = gazeY * 0.8;

      const sway = 0.05 * Math.sin(time * 0.37) + 0.025 * Math.sin(time * 0.91 + 1.3);
      const bob = 0.03 * Math.sin(time * 0.53 + 0.6);
      rig.headYaw = clamp(gazeX * 0.4 + sway, -1, 1);
      rig.headPitch = clamp(gazeY * 0.28 + bob, -1, 1);
      rig.headRoll = 0.025 * Math.sin(time * 0.29);
      rig.breath = (Math.sin(time * 0.62) + 1) / 2;
      rig.mouthForm = 0.18 + 0.05 * Math.sin(time * 0.21);
      rig.browL = 0.04 * Math.sin(time * 0.44);
      rig.browR = rig.browL;

      if (blinkStart < 0 && time >= blinkAt) {
        blinkStart = time;
        blinksLeft = Math.random() < 0.2 ? 1 : 0; // now and then, a double blink
      }
      if (blinkStart >= 0) {
        const open = blinkAmount(time - blinkStart);
        rig.eyeOpenL = open;
        rig.eyeOpenR = open;
        if (time - blinkStart > 0.28) {
          blinkStart = -1;
          if (blinksLeft > 0) {
            blinksLeft -= 1;
            blinkAt = time + 0.12;
          } else {
            blinkAt = time + between(2.5, 7);
          }
        }
      } else {
        rig.eyeOpenL = 1;
        rig.eyeOpenR = 1;
      }

      if (gestureStart < 0 && time >= gestureAt) {
        gestureStart = time;
        gestureKind = Math.random() < 0.6 ? 'shake' : 'nod';
      }
      if (gestureStart >= 0) {
        const progress = (time - gestureStart) / 1.2;
        if (progress >= 1) {
          gestureStart = -1;
          gestureAt = time + between(14, 32);
        } else if (gestureKind === 'shake') {
          rig.headYaw = clamp(rig.headYaw + 0.22 * Math.sin(progress * Math.PI * 4) * envelope(progress), -1, 1);
        } else {
          rig.headPitch = clamp(rig.headPitch + 0.16 * Math.sin(progress * Math.PI * 3) * envelope(progress), -1, 1);
        }
      }

      stage.render(dt);
    };

    // A still frame is enough when the reader asked for less motion.
    if (reduced.matches) {
      stage.render(0.016);
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerleave', onPointerLeave);
      };
    }

    let raf = 0;
    let last = performance.now();
    let visible = true;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      frame(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
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
      if (visible && !document.hidden) start();
      else stop();
    });
    intersection.observe(canvas);
    const onVisibility = () => {
      if (!document.hidden && visible) start();
      else stop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
}
