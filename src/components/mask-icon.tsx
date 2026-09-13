import type { CSSProperties } from 'react';

import { cn } from '@/lib/cn';

interface MaskIconProps {
  src: string;
  size?: number;
  className?: string;
}

/**
 * A single-color icon cut from an SVG file and painted with the current text color,
 * so it follows hover and theme colors like an inline icon.
 */
export function MaskIcon({ src, size = 16, className }: MaskIconProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };

  return <span aria-hidden className={cn('inline-block shrink-0 bg-current', className)} style={style} />;
}
