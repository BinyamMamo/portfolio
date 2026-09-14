import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/dashboard/page-header';
import { ProjectEditor } from '@/components/dashboard/project-editor';
import { requireDashboard } from '@/server/auth';
import { getAreas, getProjects } from '@/server/content';

/** `new` creates a project; any other value edits the project with that slug. */
const NEW_PROJECT = 'new';

export default async function ProjectEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireDashboard();
  const { slug } = await params;
  const [projects, areas] = await Promise.all([getProjects(), getAreas()]);
  const project = slug === NEW_PROJECT ? undefined : projects.find((item) => item.slug === slug);
  if (slug !== NEW_PROJECT && !project) notFound();

  const categories = [...new Set(projects.map((item) => item.category))];
  const topics = [...new Set(projects.flatMap((item) => item.topics ?? []))].sort();

  return (
    <>
      <PageHeader
        title={project?.name ?? 'New project'}
        description={project ? project.tagline : 'Fill in the basics and save. Media can be added after the first save.'}
      />
      <ProjectEditor key={project?.slug ?? NEW_PROJECT} project={project} categories={categories} topics={topics} areas={areas} />
    </>
  );
}
