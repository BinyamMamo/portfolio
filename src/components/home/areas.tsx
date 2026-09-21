import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Section } from '@/components/section';
import { getTech } from '@/lib/tech';
import { getAreas, getProjects } from '@/server/content';

export async function Areas({ index }: { index: string }) {
  const [areas, projects] = await Promise.all([getAreas(), getProjects()]);
  const rows = areas
    .map((area) => ({ area, projects: projects.filter((project) => project.areas?.includes(area.id)) }))
    .filter((row) => row.projects.length > 0);
  if (rows.length === 0) return null;

  return (
    <Section
      id="areas"
      index={index}
      label="Focus"
      title="What I keep coming back to"
      description="Grouped together, the projects show a pattern: practical software for health, learning and the people running real services."
    >
      <div className="divide-y border-y">
        {rows.map(({ area, projects: areaProjects }) => {
          // The most used technologies in this area, as a quick visual signature.
          const counts = new Map<string, number>();
          areaProjects.flatMap((project) => project.stack).forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
          const logos = [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => ({ id, ...getTech(id) }))
            .filter((item) => item.logo)
            .slice(0, 5);

          return (
            <div key={area.id} className="grid gap-4 py-8 md:grid-cols-[18rem_minmax(0,1fr)] md:gap-10">
              <div>
                <h3 className="text-lg font-medium text-fg">{area.title}</h3>
                <p className="mt-1 font-mono text-xs text-fg-subtle">
                  {areaProjects.length} {areaProjects.length === 1 ? 'project' : 'projects'}
                </p>
                {logos.length > 0 && (
                  <div className="mt-4 flex items-center gap-3" aria-hidden>
                    {logos.map((item) => item.logo && <Logo key={item.id} logo={item.logo} size={16} />)}
                  </div>
                )}
              </div>
              <div>
                <p className="max-w-2xl leading-relaxed text-fg-muted">{area.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {areaProjects.map((project) => (
                    <li key={project.slug}>
                      <Link href={`/projects/${project.slug}`} className="link-underline text-fg">
                        {project.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
