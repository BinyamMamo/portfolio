import { RESUME_HREF } from '@/lib/constants';
import { getProfile } from '@/server/content';

export async function SiteFooter() {
  const profile = await getProfile();
  const links = [...profile.links.map((link) => ({ label: link.label, href: link.url })), { label: 'Resume', href: RESUME_HREF }];

  return (
    <footer className="border-t">
      <div className="page-container flex flex-col gap-4 py-8 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {profile.name}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
