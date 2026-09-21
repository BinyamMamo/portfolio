import type { Project } from '@/lib/schemas';
import { getTech } from '@/lib/tech';

/** The text a project is matched against on the projects page. */
export function projectKeywords(project: Project): string {
  return [
    project.name,
    project.tagline,
    project.client?.name ?? '',
    ...project.stack.map((id) => getTech(id).name),
    ...(project.topics ?? []),
  ]
    .join(' ')
    .toLowerCase();
}

/** The projects page, filtered to one technology. */
export function techHref(techId: string): string {
  return `/projects?q=${encodeURIComponent(getTech(techId).name)}`;
}

/** A technology only links to the browser when something is there to show. */
export function hasProjectsFor(techId: string, projects: Project[]): boolean {
  const needle = getTech(techId).name.toLowerCase();
  return projects.some((project) => projectKeywords(project).includes(needle));
}
