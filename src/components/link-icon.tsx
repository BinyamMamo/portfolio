import { Globe } from 'lucide-react';

import { Logo } from '@/components/logo';
import { linkLogos } from '@/lib/links';
import type { LinkIcon as LinkIconName } from '@/lib/schemas';

export function LinkIcon({ icon, size = 16 }: { icon: LinkIconName; size?: number }) {
  const logo = linkLogos[icon];
  if (logo) return <Logo logo={logo} size={size} />;
  return <Globe aria-hidden className="shrink-0 text-fg-muted" style={{ width: size, height: size }} />;
}
