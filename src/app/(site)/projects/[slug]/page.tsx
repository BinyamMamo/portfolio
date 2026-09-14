import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { ButtonLink } from '@/components/button-link';
import { DemoFrame } from '@/components/demo-frame';
import { Logo } from '@/components/logo';
import { type CarouselSlide, ProjectCarousel } from '@/components/project-carousel';
import { ProjectMediaView } from '@/components/project-media';
import { Eyebrow } from '@/components/section';
import { TechList } from '@/components/tech-list';
import { tech } from '@/lib/tech';
import { getAreas, getProject, getProjects } from '@/server/content';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};

  const cover = project.cover;
  return {
    title: project.name,
    description: project.tagline,
    openGraph: cover ? { images: [cover.kind === 'video' ? cover.poster : cover.src] } : undefined,
  };
}

function ContentBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="heading text-xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-sm text-fg">{children}</dd>
    </div>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [projects, areas] = await Promise.all([getProjects(), getAreas()]);
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];
  if (!project) notFound();

  const nextProject = projects[(index + 1) % projects.length];
  const media = [project.cover, ...project.gallery].filter((item) => item !== undefined);
  const areaTitles = areas.filter((area) => project.areas?.includes(area.id)).map((area) => area.title);
  const slides: CarouselSlide[] = media.map((item, position) => ({
    key: item.src,
    caption: item.alt,
    thumbnail: item.kind === 'video' ? item.poster : item.src,
    media: (
      <ProjectMediaView
        media={item}
        variant="slide"
        sizes="(min-width: 1152px) 1088px, 100vw"
        preload={position === 0}
      />
    ),
  }));

  return (
    <article className="page-container pt-10 pb-24 sm:pt-14">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All projects
      </Link>

      <header className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div className="max-w-3xl">
          <Eyebrow>{project.client ? `Client work / ${project.client.name}` : project.category}</Eyebrow>
          <h1 className="heading mt-4 text-4xl sm:text-5xl">{project.name}</h1>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">{project.summary}</p>
        </div>
        {(project.liveUrl || project.repoUrl || project.notebookUrl) && (
          <div className="flex flex-wrap gap-3">
            {project.liveUrl && (
              <ButtonLink href={project.liveUrl} external>
                Visit live site
                <ArrowUpRight aria-hidden />
              </ButtonLink>
            )}
            {project.repoUrl && (
              <ButtonLink href={project.repoUrl} variant="secondary" external>
                <Logo logo={tech.github.logo} size={16} />
                Source code
              </ButtonLink>
            )}
            {project.notebookUrl && (
              <ButtonLink href={project.notebookUrl} variant="secondary" external>
                <Logo logo={tech.colab.logo} size={16} />
                Open in Colab
              </ButtonLink>
            )}
          </div>
        )}
      </header>

      {project.highlight && (
        <p className="mt-8 max-w-3xl border-l-2 border-brand pl-4 leading-relaxed text-fg">{project.highlight}</p>
      )}

      {slides.length > 1 ? (
        <ProjectCarousel slides={slides} label={project.name} className="mt-12" />
      ) : (
        <ProjectMediaView
          media={project.cover}
          project={project}
          variant="full"
          sizes="(min-width: 1152px) 1088px, 100vw"
          preload
          className="mt-12 rounded-card border"
        />
      )}

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
        <div className="max-w-2xl space-y-14">
          <ContentBlock title="Overview">
            <div className="space-y-4 leading-relaxed text-fg-muted">
              {project.overview.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </ContentBlock>
          {project.features.length > 0 && (
            <ContentBlock title="Features">
              <ul className="list-rule space-y-2.5 leading-relaxed text-fg-muted">
                {project.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </ContentBlock>
          )}
          {project.challenges.length > 0 && (
            <ContentBlock title="Challenges">
              <ul className="list-rule space-y-2.5 leading-relaxed text-fg-muted">
                {project.challenges.map((challenge) => (
                  <li key={challenge}>{challenge}</li>
                ))}
              </ul>
            </ContentBlock>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <dl className="divide-y border-y">
            {project.client && (
              <MetaRow label="Client">
                {project.client.url ? (
                  <a href={project.client.url} target="_blank" rel="noreferrer" className="link-underline">
                    {project.client.name}
                  </a>
                ) : (
                  project.client.name
                )}
              </MetaRow>
            )}
            {project.client?.role && <MetaRow label="Role">{project.client.role}</MetaRow>}
            {project.year && <MetaRow label="Year">{project.year}</MetaRow>}
            <MetaRow label="Stack">
              <TechList ids={project.stack} className="flex-col gap-y-2.5 [&_li]:text-sm [&_li]:text-fg" />
            </MetaRow>
            {areaTitles.length > 0 && <MetaRow label="Areas">{areaTitles.join(', ')}</MetaRow>}
            {project.topics && project.topics.length > 0 && (
              <MetaRow label="Topics">{project.topics.join(', ')}</MetaRow>
            )}
          </dl>
        </aside>
      </div>

      {project.demo && (
        <section className="mt-24" aria-labelledby="demo-title">
          <h2 id="demo-title" className="heading text-xl">
            Try it
          </h2>
          <div className="mt-8">
            <DemoFrame url={project.demo.url} label={project.demo.label} title={project.name} />
          </div>
        </section>
      )}

      {nextProject && nextProject.slug !== project.slug && (
        <nav aria-label="Next project" className="mt-24 border-t pt-8">
          <Link href={`/projects/${nextProject.slug}`} className="group flex items-center justify-between gap-6">
            <span>
              <Eyebrow>Next project</Eyebrow>
              <span className="heading mt-2 block text-2xl transition-colors group-hover:text-brand">
                {nextProject.name}
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-6 shrink-0 text-fg-subtle transition group-hover:translate-x-1 group-hover:text-fg"
            />
          </Link>
        </nav>
      )}
    </article>
  );
}
