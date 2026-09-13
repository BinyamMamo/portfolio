export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavLinkGroup {
  title: string;
  items: NavLink[];
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
  groups: NavLinkGroup[];
  featured?: NavFeature;
  footer: NavLink;
}

export type NavEntry = NavLink | NavMega;

export function isNavMega(entry: NavEntry): entry is NavMega {
  return 'groups' in entry;
}
