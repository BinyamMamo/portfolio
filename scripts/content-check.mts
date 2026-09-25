/**
 * Validates every file in content/ against its schema and checks references between files
 * (navigation and CV slugs, variant ids). Run with `pnpm content:check`; exits non-zero on problems.
 */
import { contentNames, listCvVariants, readContent } from '../src/server/content-store';

const problems: string[] = [];

for (const name of contentNames) {
  try {
    await readContent(name);
    console.log(`ok    ${name}`);
  } catch (error) {
    problems.push((error as Error).message);
    console.log(`fail  ${name}`);
  }
}

try {
  const [projects, experience, navigation, settings, variants, areas, certifications, activities, skills] =
    await Promise.all([
      readContent('projects'),
      readContent('experience'),
      readContent('navigation'),
      readContent('cvSettings'),
      listCvVariants(),
      readContent('areas'),
      readContent('certifications'),
      readContent('activities'),
      readContent('skills'),
    ]);
  const slugs = new Set(projects.map((project) => project.slug));
  const areaIds = new Set(areas.map((area) => area.id));
  const experienceIds = new Set(experience.map((entry) => entry.id));
  const credentialIds = new Set(certifications.map((item) => item.id));
  const activityIds = new Set(activities.map((entry) => entry.id));
  const skillGroupIds = new Set(skills.map((group) => group.id));
  const missing = (label: string, values: string[], known: Set<string>) =>
    values.filter((value) => !known.has(value)).forEach((value) => problems.push(`${label}: unknown "${value}"`));

  for (const project of projects) missing(`projects.${project.slug}.areas`, project.areas ?? [], areaIds);
  for (const project of projects.filter((item) => item.kind === 'client' && !item.client)) {
    problems.push(`projects.${project.slug}: client projects need a client name`);
  }
  missing(
    'navigation.projectGroups',
    navigation.projectGroups.flatMap((group) => group.slugs),
    slugs,
  );
  if (navigation.featured) missing('navigation.featured', [navigation.featured.slug], slugs);
  missing('cv/settings.projectSlugs', settings.projectSlugs, slugs);
  for (const line of settings.skillLines ?? []) {
    missing(`cv/settings.skillLines.${line.label}`, line.groups, skillGroupIds);
  }
  for (const variant of variants) {
    missing(`cv/variants/${variant.slug}.projectSlugs`, variant.projectSlugs ?? [], slugs);
    missing(`cv/variants/${variant.slug}.experienceIds`, variant.experienceIds ?? [], experienceIds);
    missing(`cv/variants/${variant.slug}.credentialIds`, variant.credentialIds ?? [], credentialIds);
    missing(`cv/variants/${variant.slug}.activityIds`, variant.activityIds ?? [], activityIds);
    for (const line of variant.skillLines ?? []) {
      missing(`cv/variants/${variant.slug}.skillLines.${line.label}`, line.groups, skillGroupIds);
    }
  }
  console.log(`ok    cv variants (${variants.length})`);

  // Placeholder content is staged in the repo before the real thing arrives, but it must never print.
  // Guards the default CV's own selection, not just whether the section is turned on: an id list
  // that names only real entries is fine even while placeholders remain in the file.
  const placeholderIds = new Set(
    activities
      .filter((entry) => [entry.title, entry.org, ...entry.points].some((text) => text.includes('PLACEHOLDER')))
      .map((entry) => entry.id),
  );
  if (placeholderIds.size > 0 && (settings.sections ?? []).includes('activities')) {
    const shown = settings.activityIds ?? activities.map((entry) => entry.id);
    const leaking = shown.filter((id) => placeholderIds.has(id));
    if (leaking.length > 0) {
      problems.push(`cv/settings would print placeholder activities: ${leaking.join(', ')}`);
    }
  }
} catch (error) {
  problems.push((error as Error).message);
}

if (problems.length > 0) {
  console.error(`\n${problems.join('\n\n')}`);
  process.exit(1);
}
console.log('\nAll content is valid.');
