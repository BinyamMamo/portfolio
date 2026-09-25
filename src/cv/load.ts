/** Loads everything a CV needs from content/. No framework imports, so scripts/cv-pdf.mts can use it. */
import { type CvContent, type ResolvedCv, resolveCv } from '@/cv/resolve';
import type { CvTemplateId } from '@/lib/schemas';
import { readContent, readCvVariant } from '@/server/content-store';

export async function loadCvContent(): Promise<CvContent> {
  const [profile, projects, experience, education, certifications, activities, skills, settings] = await Promise.all([
    readContent('profile'),
    readContent('projects'),
    readContent('experience'),
    readContent('education'),
    readContent('certifications'),
    readContent('activities'),
    readContent('skills'),
    readContent('cvSettings'),
  ]);
  return { profile, projects, experience, education, certifications, activities, skills, settings };
}

interface CvOptions {
  /** Slug of a tailored version in content/cv/variants. */
  variant?: string;
  /** Overrides the template chosen by the settings or the variant. */
  template?: CvTemplateId;
}

/** Resolved CV data, or undefined when the requested variant does not exist. */
export async function getResolvedCv({ variant: slug, template }: CvOptions = {}): Promise<ResolvedCv | undefined> {
  const content = await loadCvContent();
  const variant = slug ? await readCvVariant(slug) : undefined;
  if (slug && !variant) return undefined;

  const cv = resolveCv(content, variant);
  return template ? { ...cv, template } : cv;
}
