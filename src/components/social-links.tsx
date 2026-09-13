import { LinkIcon } from '@/components/link-icon';
import { cn } from '@/lib/cn';
import { getProfile } from '@/server/content';

export async function SocialLinks({ className }: { className?: string }) {
  const { links } = await getProfile();

  return (
    <ul className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', className)}>
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            <LinkIcon icon={link.icon} size={16} />
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
