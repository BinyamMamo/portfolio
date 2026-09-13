import type { LinkIcon } from '@/lib/schemas';
import { type LogoSource, tech } from '@/lib/tech';

/** Brand logos for profile links. Links without one (website) fall back to a generic icon. */
export const linkLogos: Record<LinkIcon, LogoSource | undefined> = {
  github: tech.github.logo,
  linkedin: { icon: '/icons/linkedin.svg' },
  whatsapp: { icon: '/icons/whatsapp.svg' },
  website: undefined,
};
