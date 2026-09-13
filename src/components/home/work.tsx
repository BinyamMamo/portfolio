import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { ButtonLink } from '@/components/button-link';
import { Logo } from '@/components/logo';
import { ProjectMediaView } from '@/components/project-media';
import { Section } from '@/components/section';
import { TechList } from '@/components/tech-list';
import { featuredProjects, type Project, projects } from '@/content/projects';
import { cn } from '@/lib/cn';
import { getTech } from '@/lib/tech';

const textLink = 'inline-flex items-center gap-1.5 transition-colors [&_svg]:size-4';

function FeaturedRow({ project, reversed }: { project: Project; reversed: boolean }) {
  const href = `/projects/${project.slug}`;

  return (
    <article data-hover-play className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className={cn(
          'block overflow-hidden rounded-card border transition-colors hover:border-border-strong lg:col-span-7',
          reversed && 'lg:order-2',
        )}
      >
        <ProjectMediaView
          media={project.cover}
          project={project}
          variant="card"
          sizes="(min-width: 1152px) 640px, (min-width: 1024px) 56vw, 100vw"
        />
      </Link>
      <div className="lg:col-span-5">
        <p className="font-mono text-xs text-fg-subtle">{project.category}</p>
        <h3 className="heading mt-3 text-2xl">
          <Link href={href} className="transition-colors hover:text-accent">
            {project.name}
          </Link>
        </h3>
        <p className="mt-3 leading-relaxed text-fg-muted">{project.summary}</p>
        {project.highlight && (
          <p className="mt-5 border-l-2 border-accent pl-3 text-sm leading-relaxed text-fg">{project.highlight}</p>
        )}
        <TechList ids={project.stack} className="mt-6" />
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link href={href} className={cn(textLink, 'font-medium text-fg hover:text-accent')}>
            Project details
            <ArrowRight aria-hidden />
          </Link>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className={cn(textLink, 'text-fg-muted hover:text-fg')}>
              Live site
              <ArrowUpRight aria-hidden />
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer" className={cn(textLink, 'text-fg-muted hover:text-fg')}>
              Source
              <ArrowUpRight aria-hidden />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Work() {
  const others = projects.filter((project) => !project.featured);

  return (
    <Section
      id="work"
      index="01"
      label="Work"
      title="Selected projects"
      description="Platforms and tools I have designed and built, from competition entries to production web apps."
    >
      <div className="space-y-20 sm:space-y-28">
        {featuredProjects.map((project, index) => (
          <FeaturedRow key={project.slug} project={project} reversed={index % 2 === 1} />
        ))}
      </div>

      <div className="mt-24 sm:mt-32">
        <div className="flex items-end justify-between gap-6">
          <h3 className="text-lg font-medium text-fg">More projects</h3>
          <ButtonLink href="/projects" variant="secondary">
            All projects
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
        <ul className="mt-6 divide-y border-y">
          {others.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/projects/${project.slug}`}
                className="group grid gap-1 py-5 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-center sm:gap-8"
              >
                <span className="font-medium text-fg transition-colors group-hover:text-accent">{project.name}</span>
                <span className="truncate text-sm text-fg-muted">{project.tagline}</span>
                <span className="hidden items-center gap-3 sm:flex">
                  {project.stack.map((id) => {
                    const { logo } = getTech(id);
                    return logo ? <Logo key={id} logo={logo} size={16} /> : null;
                  })}
                  <ArrowRight
                    aria-hidden
                    className="ml-2 size-4 text-fg-subtle transition group-hover:translate-x-0.5 group-hover:text-fg"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
