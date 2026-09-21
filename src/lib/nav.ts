import type { LogoSource } from '@/lib/tech';

/** Lucide icons available to menu items, referenced by name so nav data stays serializable. */
export type NavIcon = 'mail' | 'file' | 'globe';

/** What the mega menu's side panel shows while an item is hovered. */
export interface NavPreview {
  image: string;
  eyebrow: string;
  summary: string;
}

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  preview?: NavPreview;
  logo?: LogoSource;
  icon?: NavIcon;
  /** Opens in a new tab. */
  external?: boolean;
}

export interface NavLinkGroup {
  title: string;
  items: NavLink[];
  /** Shows only this many at first, with a button for the rest. */
  visible?: number;
}

export interface NavFeature {
  eyebrow: string;
  label: string;
  href: string;
  description: string;
  image: string;
}

/** A top bar entry that opens a full-width panel of grouped links. */
export interface NavMega {
  label: string;
  /** Section the menu belongs to. Used as a single mobile link when the groups are not expanded. */
  href: string;
  groups: NavLinkGroup[];
  featured?: NavFeature;
  footer: NavLink;
  /** Show every group in the mobile menu instead of a single link to `href`. */
  expandOnMobile: boolean;
  /** Fixed column count on wide screens, when the groups are meant to fill a grid. */
  columns?: number;
}

export type NavEntry = NavLink | NavMega;

export function isNavMega(entry: NavEntry): entry is NavMega {
  return 'groups' in entry;
}
