import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Class merging for shadcn/ui components: later Tailwind classes override conflicting earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
