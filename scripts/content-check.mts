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
  const [projects, experience, navigation, settings, variants] = await Promise.all([
    readContent('projects'),
    readContent('experience'),
    readContent('navigation'),
    readContent('cvSettings'),
    listCvVariants(),
  ]);
  const slugs = new Set(projects.map((project) => project.slug));
  const experienceIds = new Set(experience.map((entry) => entry.id));
  const missing = (label: string, values: string[], known: Set<string>) =>
    values.filter((value) => !known.has(value)).forEach((value) => problems.push(`${label}: unknown "${value}"`));

  missing('navigation.projectGroups', navigation.projectGroups.flatMap((group) => group.slugs), slugs);
  if (navigation.featured) missing('navigation.featured', [navigation.featured.slug], slugs);
  missing('cv/settings.projectSlugs', settings.projectSlugs, slugs);
  for (const variant of variants) {
    missing(`cv/variants/${variant.slug}.projectSlugs`, variant.projectSlugs ?? [], slugs);
    missing(`cv/variants/${variant.slug}.experienceIds`, variant.experienceIds ?? [], experienceIds);
  }
  console.log(`ok    cv variants (${variants.length})`);
} catch (error) {
  problems.push((error as Error).message);
}

if (problems.length > 0) {
  console.error(`\n${problems.join('\n\n')}`);
  process.exit(1);
}
console.log('\nAll content is valid.');
