import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { ProjectMediaView } from '@/components/project-media';
import { Section } from '@/components/section';
import { TechList } from '@/components/tech-list';
import { cn } from '@/lib/cn';
import { getProjects } from '@/server/content';

export async function ClientWork({ index }: { index: string }) {
  const clients = (await getProjects()).filter((project) => project.kind === 'client');
  if (clients.length === 0) return null;

  return (
    <Section
      id="clients"
      index={index}
      label="Client work"
      title="Built with and for other teams"
      description="Products I have worked on for companies, a university and an internship team. Screens show demo data."
    >
      <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
        {clients.map((project, position) => {
          const href = `/projects/${project.slug}`;
          const meta = [project.client?.name, project.year].filter(Boolean).join(' / ');
          return (
            <li
              key={project.slug}
              data-hover-play
              // With an odd count, the first project gets the full width so the grid stays even.
              className={cn(position === 0 && clients.length % 2 === 1 && 'md:col-span-2')}
            >
              <Link
                href={href}
                tabIndex={-1}
                aria-hidden
                className="block overflow-hidden rounded-card border transition-colors hover:border-border-strong"
              >
                <ProjectMediaView
                  media={project.cover}
                  project={project}
                  variant="card"
                  sizes={position === 0 && clients.length % 2 === 1 ? '(min-width: 1152px) 1088px, 100vw' : '(min-width: 768px) 50vw, 100vw'}
                />
              </Link>
              <p className="mt-6 font-mono text-xs text-fg-subtle">{meta}</p>
              <h3 className="heading mt-2 text-xl">
                <Link href={href} className="transition-colors hover:text-brand">
                  {project.name}
                </Link>
              </h3>
              {project.client?.role && <p className="mt-1 text-sm text-fg">{project.client.role}</p>}
              <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">{project.summary}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <TechList ids={project.stack} limit={6} />
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    Live site
                    <ArrowUpRight aria-hidden className="size-4" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
