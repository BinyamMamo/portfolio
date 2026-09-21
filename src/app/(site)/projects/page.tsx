import type { Metadata } from 'next';

import { ProjectCard } from '@/components/project-card';
import { type BrowserItem, type BrowserTab, ProjectsBrowser } from '@/components/projects-browser';
import { Eyebrow } from '@/components/section';
import { projectKeywords } from '@/lib/search';
import { getAreas, getProjects } from '@/server/content';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Client products, health and learning tools, AI experiments and simulations.',
};

const CLIENT_TAB = 'client';

export default async function ProjectsPage() {
  const [projects, areas] = await Promise.all([getProjects(), getAreas()]);
  const tabs: BrowserTab[] = [
    { id: CLIENT_TAB, label: 'Client work' },
    ...areas.map((area) => ({ id: area.id, label: area.title })),
  ];
  const items: BrowserItem[] = projects.map((project) => ({
    slug: project.slug,
    groups: [...(project.areas ?? []), ...(project.kind === 'client' ? [CLIENT_TAB] : [])],
    keywords: projectKeywords(project),
    card: <ProjectCard project={project} />,
  }));

  return (
    <div className="page-container pt-14 pb-24 sm:pt-20">
      <header className="max-w-2xl">
        <Eyebrow>Projects</Eyebrow>
        <h1 className="heading mt-4 text-4xl sm:text-5xl">Things I have built</h1>
        <p className="mt-5 text-lg leading-relaxed text-fg-muted">
          Products for clients and teams, tools for health and learning, and experiments with AI, robots and
          simulations.
        </p>
      </header>
      <ProjectsBrowser items={items} tabs={tabs} />
    </div>
  );
}
