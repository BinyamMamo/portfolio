import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

const variants = {
  primary: 'bg-fg text-bg hover:opacity-85',
  secondary: 'border border-border-strong text-fg hover:bg-surface-muted',
} as const;

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  /** Opens in a new tab. Use for other sites and files such as the resume. */
  external?: boolean;
  className?: string;
}

export function ButtonLink({ href, children, variant = 'primary', external = false, className }: ButtonLinkProps) {
  const classes = cn(
    'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium whitespace-nowrap transition-[opacity,background-color] [&_svg]:size-4',
    variants[variant],
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
