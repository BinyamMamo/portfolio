import type { Metadata } from 'next';

import { ProjectCard } from '@/components/project-card';
import { type BrowserItem, ProjectsBrowser } from '@/components/projects-browser';
import { Eyebrow } from '@/components/section';
import { projectCategories, projects } from '@/content/projects';
import { getTech } from '@/lib/tech';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Web platforms, AI tools and experiments built by Binyam Mamo.',
};

export default function ProjectsPage() {
  const items: BrowserItem[] = projects.map((project) => ({
    slug: project.slug,
    category: project.category,
    keywords: [project.name, project.tagline, ...project.stack.map((id) => getTech(id).name), ...(project.topics ?? [])]
      .join(' ')
      .toLowerCase(),
    card: <ProjectCard project={project} />,
  }));

  return (
    <div className="page-container pt-14 pb-24 sm:pt-20">
      <header className="max-w-2xl">
        <Eyebrow>Projects</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Things I have built</h1>
        <p className="mt-5 text-lg leading-relaxed text-fg-muted">
          Web platforms, AI tools and a few experiments, from university competitions to side projects.
        </p>
      </header>
      <ProjectsBrowser items={items} categories={projectCategories} />
    </div>
  );
}
