import { Logo } from '@/components/logo';
import { Section } from '@/components/section';
import { getTech } from '@/lib/tech';
import { getSkillGroups } from '@/server/content';

export async function Skills() {
  const skillGroups = await getSkillGroups();
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
                return (
                  <li key={id} className="flex items-center gap-3 text-sm text-fg">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-control border bg-surface">
                      {logo ? (
                        <Logo logo={logo} size={18} />
                      ) : (
                        <span aria-hidden className="font-mono text-xs text-fg-muted uppercase">
                          {name.slice(0, 2)}
                        </span>
                      )}
                    </span>
                    {name}
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
