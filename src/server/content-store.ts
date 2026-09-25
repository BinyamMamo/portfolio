/**
 * Reads and writes the JSON files in content/. Deliberately free of Next.js and React imports so the
 * scripts in scripts/ can use it too. App code should prefer the cached getters in ./content.ts.
 */
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import {
  type Area,
  areasSchema,
  type CvSettings,
  cvSettingsSchema,
  type CvVariant,
  cvVariantSchema,
  type Credential,
  credentialsSchema,
  type NavigationContent,
  navigationSchema,
  type Profile,
  profileSchema,
  type Project,
  projectsSchema,
  type SkillGroup,
  skillGroupsSchema,
  type TimelineEntry,
  timelineSchema,
} from '@/lib/schemas';

export const CONTENT_DIR = path.join(process.cwd(), 'content');
const VARIANTS_DIR = path.join(CONTENT_DIR, 'cv', 'variants');

interface ContentMap {
  profile: Profile;
  projects: Project[];
  experience: TimelineEntry[];
  education: TimelineEntry[];
  certifications: Credential[];
  activities: TimelineEntry[];
  skills: SkillGroup[];
  areas: Area[];
  navigation: NavigationContent;
  cvSettings: CvSettings;
}

export type ContentName = keyof ContentMap;

const sources: { [Name in ContentName]: { file: string; schema: z.ZodType<ContentMap[Name]> } } = {
  profile: { file: 'profile.json', schema: profileSchema },
  projects: { file: 'projects.json', schema: projectsSchema },
  experience: { file: 'experience.json', schema: timelineSchema },
  education: { file: 'education.json', schema: timelineSchema },
  certifications: { file: 'certifications.json', schema: credentialsSchema },
  activities: { file: 'activities.json', schema: timelineSchema },
  skills: { file: 'skills.json', schema: skillGroupsSchema },
  areas: { file: 'areas.json', schema: areasSchema },
  navigation: { file: 'navigation.json', schema: navigationSchema },
  cvSettings: { file: 'cv/settings.json', schema: cvSettingsSchema },
};

export const contentNames = Object.keys(sources) as ContentName[];

export class ContentValidationError extends Error {}

function parse<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentValidationError(`${label} is invalid:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  // Write to a temporary file first so a crash never leaves a half-written JSON file behind.
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`);
  await rename(temporary, file);
}

export async function readContent<Name extends ContentName>(name: Name): Promise<ContentMap[Name]> {
  const { file, schema } = sources[name];
  const raw: unknown = JSON.parse(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
  return parse(schema, raw, `content/${file}`);
}

export async function writeContent<Name extends ContentName>(name: Name, data: ContentMap[Name]): Promise<void> {
  const { file, schema } = sources[name];
  await writeJson(path.join(CONTENT_DIR, file), parse(schema, data, `content/${file}`));
}

/* CV variants: one file per tailored CV in content/cv/variants/<slug>.json */

function variantFile(slug: string): string {
  const safe = cvVariantSchema.shape.slug.parse(slug);
  return path.join(VARIANTS_DIR, `${safe}.json`);
}

export async function listCvVariants(): Promise<CvVariant[]> {
  const entries = await readdir(VARIANTS_DIR).catch(() => []);
  const files = entries.filter((entry) => entry.endsWith('.json')).sort();
  return Promise.all(
    files.map(async (entry) => {
      const raw: unknown = JSON.parse(await readFile(path.join(VARIANTS_DIR, entry), 'utf8'));
      return parse(cvVariantSchema, raw, `content/cv/variants/${entry}`);
    }),
  );
}

export async function readCvVariant(slug: string): Promise<CvVariant | undefined> {
  const raw = await readFile(variantFile(slug), 'utf8').catch(() => undefined);
  return raw === undefined ? undefined : parse(cvVariantSchema, JSON.parse(raw), `content/cv/variants/${slug}.json`);
}

export async function writeCvVariant(variant: CvVariant): Promise<void> {
  const parsed = parse(cvVariantSchema, variant, 'CV variant');
  await writeJson(variantFile(parsed.slug), parsed);
}

export async function deleteCvVariant(slug: string): Promise<void> {
  await rm(variantFile(slug), { force: true });
}
