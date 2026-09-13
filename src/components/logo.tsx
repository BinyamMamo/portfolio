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

  if (!logo.iconDark) {
    return <Image src={logo.icon} alt="" aria-hidden width={size} height={size} unoptimized className={base} />;
  }

  return (
    <>
      <Image
        src={logo.icon}
        alt=""
        aria-hidden
        width={size}
        height={size}
        unoptimized
        className={cn(base, 'dark:hidden')}
      />
      <Image
        src={logo.iconDark}
        alt=""
        aria-hidden
        width={size}
        height={size}
        unoptimized
        className={cn(base, 'hidden dark:block')}
      />
    </>
  );
}
