'use server';

import { revalidatePath } from 'next/cache';

import type {
  CvSettings,
  CvVariant,
  NavigationContent,
  Profile,
  Project,
  SkillGroup,
  TimelineEntry,
} from '@/lib/schemas';
import { requireDashboard } from '@/server/auth';
import {
  ContentValidationError,
  deleteCvVariant as removeCvVariantFile,
  readContent,
  readCvVariant,
  writeContent,
  writeCvVariant,
} from '@/server/content-store';

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Every write goes through here: session check, the write itself (which validates against the schema),
 * then a refresh of the public pages. Validation problems come back as messages; anything else throws.
 */
async function mutate(write: () => Promise<void>): Promise<ActionResult> {
  await requireDashboard();
  try {
    await write();
  } catch (error) {
    if (error instanceof ContentValidationError) return { ok: false, error: error.message };
    throw error;
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function saveProfile(profile: Profile): Promise<ActionResult> {
  return mutate(() => writeContent('profile', profile));
}

export async function saveExperience(entries: TimelineEntry[]): Promise<ActionResult> {
  return mutate(() => writeContent('experience', entries));
}

export async function saveEducation(entries: TimelineEntry[]): Promise<ActionResult> {
  return mutate(() => writeContent('education', entries));
}

export async function saveSkills(groups: SkillGroup[]): Promise<ActionResult> {
  return mutate(() => writeContent('skills', groups));
}

export async function saveNavigation(navigation: NavigationContent): Promise<ActionResult> {
  return mutate(() => writeContent('navigation', navigation));
}

export async function saveCvSettings(settings: CvSettings): Promise<ActionResult> {
  return mutate(() => writeContent('cvSettings', settings));
}

/** Reorders projects or toggles flags on several at once. */
export async function saveProjects(projects: Project[]): Promise<ActionResult> {
  return mutate(() => writeContent('projects', projects));
}

/** Replaces slug `from` with `to` (or removes it when `to` is null) wherever other files reference projects. */
async function updateProjectReferences(from: string, to: string | null): Promise<void> {
  const replace = (slugs: string[]) =>
    slugs.flatMap((slug) => (slug === from ? (to === null ? [] : [to]) : [slug]));

  const navigation = await readContent('navigation');
  const featured =
    navigation.featured?.slug === from
      ? to === null
        ? undefined
        : { ...navigation.featured, slug: to }
      : navigation.featured;
  await writeContent('navigation', {
    projectGroups: navigation.projectGroups.map((group) => ({ ...group, slugs: replace(group.slugs) })),
    featured,
  });

  const settings = await readContent('cvSettings');
  await writeContent('cvSettings', { ...settings, projectSlugs: replace(settings.projectSlugs) });
}

/** Creates a project, or updates the one currently stored under `originalSlug`. */
export async function saveProject(project: Project, originalSlug?: string): Promise<ActionResult> {
  return mutate(async () => {
    const projects = await readContent('projects');
    const index = originalSlug ? projects.findIndex((existing) => existing.slug === originalSlug) : -1;
    const clash = projects.some((existing, position) => existing.slug === project.slug && position !== index);
    if (clash) throw new ContentValidationError(`Another project already uses the slug "${project.slug}".`);

    if (index === -1) projects.push(project);
    else projects[index] = project;
    await writeContent('projects', projects);

    if (originalSlug && originalSlug !== project.slug) await updateProjectReferences(originalSlug, project.slug);
  });
}

/** Removes a project and every reference to it. Its media files stay on disk. */
export async function deleteProject(slug: string): Promise<ActionResult> {
  return mutate(async () => {
    const projects = await readContent('projects');
    await writeContent(
      'projects',
      projects.filter((project) => project.slug !== slug),
    );
    await updateProjectReferences(slug, null);
  });
}

/** Creates a CV variant, or updates the one stored under `originalSlug` (renaming its file if needed). */
export async function saveCvVariant(variant: CvVariant, originalSlug?: string): Promise<ActionResult> {
  return mutate(async () => {
    if (variant.slug !== originalSlug && (await readCvVariant(variant.slug))) {
      throw new ContentValidationError(`A CV version with the slug "${variant.slug}" already exists.`);
    }
    await writeCvVariant(variant);
    if (originalSlug && originalSlug !== variant.slug) await removeCvVariantFile(originalSlug);
  });
}

export async function deleteCvVariant(slug: string): Promise<ActionResult> {
  return mutate(() => removeCvVariantFile(slug));
}
