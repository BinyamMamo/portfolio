import { site } from '@/content/site';

export function SiteFooter() {
  const links = [...site.socials, { label: 'Resume', href: site.resume }];

  return (
    <footer className="border-t">
      <div className="page-container flex flex-col gap-4 py-8 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.label}>
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
