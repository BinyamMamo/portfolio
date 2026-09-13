import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/** Styles live in globals.css (btn, btn-primary, btn-secondary). */
const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
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
  const classes = cn('btn', variants[variant], className);

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
