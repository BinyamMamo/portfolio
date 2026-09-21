import 'server-only';

import { cache } from 'react';

import { listCvVariants, readContent, readCvVariant } from '@/server/content-store';

// Memoized per request, so every component on a page can ask for data without re-reading files.

export const getProfile = cache(() => readContent('profile'));
export const getProjects = cache(() => readContent('projects'));
export const getExperience = cache(() => readContent('experience'));
export const getEducation = cache(() => readContent('education'));
export const getSkillGroups = cache(() => readContent('skills'));
export const getAreas = cache(() => readContent('areas'));
export const getNavigationContent = cache(() => readContent('navigation'));
export const getCvSettings = cache(() => readContent('cvSettings'));
export const getCvVariants = cache(() => listCvVariants());
export const getCvVariant = cache((slug: string) => readCvVariant(slug));

export const getProject = cache(async (slug: string) => {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
});
