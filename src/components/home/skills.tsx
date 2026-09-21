import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Section } from '@/components/section';
import { hasProjectsFor, techHref } from '@/lib/search';
import { getTech } from '@/lib/tech';
import { getProjects, getSkillGroups } from '@/server/content';

export async function Skills() {
  const [skillGroups, projects] = await Promise.all([getSkillGroups(), getProjects()]);
  if (skillGroups.length === 0) return null;

  return (
    <Section
      id="skills"
      index="04"
      label="Skills"
      title="Tools of the trade"
      description="Backend first, with enough frontend and infrastructure to ship complete products."
    >
      <div className="divide-y border-y">
        {skillGroups.map((group) => (
          <div key={group.id} className="grid gap-5 py-7 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8">
            <h3 className="eyebrow md:pt-2.5">{group.title}</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((id) => {
                const { name, logo } = getTech(id);
                const mark = (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-control border bg-surface transition-colors group-hover/skill:border-border-strong">
                    {logo ? (
                      <Logo logo={logo} size={18} />
                    ) : (
                      <span aria-hidden className="font-mono text-xs text-fg-muted uppercase">
                        {name.slice(0, 2)}
                      </span>
                    )}
                  </span>
                );
                // Only a skill some project was built with leads anywhere.
                if (!hasProjectsFor(id, projects)) {
                  return (
                    <li key={id} className="flex items-center gap-3 text-sm text-fg">
                      {mark}
                      {name}
                    </li>
                  );
                }
                return (
                  <li key={id}>
                    <Link
                      href={techHref(id)}
                      title={`Projects built with ${name}`}
                      className="group/skill flex items-center gap-3 text-sm text-fg transition-colors hover:text-brand/80"
                    >
                      {mark}
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
