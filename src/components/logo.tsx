import Image from 'next/image';

import { cn } from '@/lib/cn';
import type { LogoSource } from '@/lib/tech';

interface LogoProps {
  logo: LogoSource;
  size?: number;
  className?: string;
}

/** Renders a brand logo, swapping to the dark variant under the dark theme when one exists. */
export function Logo({ logo, size = 16, className }: LogoProps) {
  const base = cn('shrink-0 object-contain', className);
  // Explicit CSS size: the base stylesheet sets img height to auto, which next/image flags as a distortion.
  const shared = { 'aria-hidden': true, width: size, height: size, unoptimized: true, style: { width: size, height: size } };

  if (!logo.iconDark) {
    return <Image src={logo.icon} alt="" {...shared} className={base} />;
  }

  return (
    <>
      <Image src={logo.icon} alt="" {...shared} className={cn(base, 'dark:hidden')} />
      <Image src={logo.iconDark} alt="" {...shared} className={cn(base, 'hidden dark:block')} />
    </>
  );
}
