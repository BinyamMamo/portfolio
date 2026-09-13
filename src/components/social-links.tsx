import { Logo } from '@/components/logo';
import { site } from '@/content/site';
import { cn } from '@/lib/cn';

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', className)}>
      {site.socials.map((social) => (
        <li key={social.label}>
          <a
            href={social.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            <Logo logo={social.logo} size={16} />
            {social.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
