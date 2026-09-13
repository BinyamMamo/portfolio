import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ProjectMediaView } from '@/components/project-media';
import { TechList } from '@/components/tech-list';
import type { Project } from '@/lib/schemas';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      data-hover-play
      className="card group relative flex h-full flex-col overflow-hidden rounded-card transition-colors hover:border-border-strong"
    >
      <ProjectMediaView
        media={project.cover}
        project={project}
        variant="card"
        sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
        className="border-b"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-medium text-fg">
            {/* The pseudo-element stretches the link over the whole card. */}
            <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
              {project.name}
            </Link>
          </h3>
          <ArrowRight
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-fg-subtle transition group-hover:translate-x-0.5 group-hover:text-fg"
          />
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-muted">{project.tagline}</p>
        <div className="mt-auto pt-5">
          <TechList ids={project.stack} />
        </div>
      </div>
    </article>
  );
}
