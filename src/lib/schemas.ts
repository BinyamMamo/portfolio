/**
 * Schemas for everything stored in content/. Shared by the public site, the dashboard forms,
 * the server actions, the CV renderer and the scripts, so they all agree on one shape.
 */
import { z } from 'zod';

const required = (label: string) => z.string().trim().min(1, `${label} is required`);
const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes');
const dimension = z.number().int().positive();

/* Media */

export const mediaSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('video'),
    src: required('Source'),
    poster: required('Poster'),
    alt: z.string().trim(),
    width: dimension,
    height: dimension,
  }),
  z.object({
    kind: z.literal('image'),
    src: required('Source'),
    alt: z.string().trim(),
    width: dimension,
    height: dimension,
  }),
]);
export type ProjectMedia = z.infer<typeof mediaSchema>;

/* Profile */

export const linkIcons = ['github', 'linkedin', 'whatsapp', 'website'] as const;
export type LinkIcon = (typeof linkIcons)[number];

export const linkSchema = z.object({
  label: required('Label'),
  handle: z.string().trim(),
  url: required('URL'),
  icon: z.enum(linkIcons),
});
export type ProfileLink = z.infer<typeof linkSchema>;

export const factSchema = z.object({
  value: required('Value'),
  label: required('Label'),
});

export const profileSchema = z.object({
  name: required('Name'),
  role: required('Role'),
  location: z.string().trim(),
  email: z.email('Enter a valid email'),
  phone: z.string().trim(),
  siteUrl: z.url('Enter a full URL, including https://'),
  avatar: z.string().trim(),
  /** Hero paragraph. Supports [label](https://link) for inline links. */
  intro: z.string().trim(),
  /** Short professional summary used for SEO and as the CV summary. */
  summary: z.string().trim(),
  facts: z.array(factSchema).max(4),
  links: z.array(linkSchema),
});
export type Profile = z.infer<typeof profileSchema>;

/* Projects */

export const projectKinds = ['personal', 'client'] as const;
export type ProjectKind = (typeof projectKinds)[number];
/** `live` is deployed and working, `prototype` is deployed or runnable but unfinished. */
export const projectStatuses = ['live', 'prototype', 'local', 'archived'] as const;

export const clientSchema = z.object({
  name: required('Client name'),
  url: z.string().trim().optional(),
  role: z.string().trim().optional(),
});

export const areaSchema = z.object({
  id: slug,
  title: required('Title'),
  summary: z.string().trim(),
});
export type Area = z.infer<typeof areaSchema>;
export const areasSchema = z.array(areaSchema);

export const projectSchema = z.object({
  slug,
  name: required('Name'),
  tagline: required('Tagline'),
  summary: required('Summary'),
  category: required('Category'),
  /** Tech ids from src/lib/tech.ts, or any custom name. */
  stack: z.array(z.string().trim().min(1)),
  topics: z.array(z.string().trim().min(1)).optional(),
  highlight: z.string().trim().optional(),
  liveUrl: z.string().trim().optional(),
  repoUrl: z.string().trim().optional(),
  featured: z.boolean(),
  /** Client work is listed in its own section. Missing means personal. */
  kind: z.enum(projectKinds).optional(),
  client: clientSchema.optional(),
  /** Area ids from content/areas.json. */
  areas: z.array(slug).optional(),
  year: z.string().trim().optional(),
  status: z.enum(projectStatuses).optional(),
  /** A Google Colab notebook for projects that are easier to try there. */
  notebookUrl: z.string().trim().optional(),
  /** An interactive demo embedded on the project page. */
  demo: z.object({ url: required('Demo URL'), label: required('Demo label') }).optional(),
  cover: mediaSchema.optional(),
  /** Image for the header menu preview, when a gallery shot reads better there than the cover. */
  menuImage: z.string().trim().optional(),
  gallery: z.array(mediaSchema),
  overview: z.array(z.string().trim().min(1)),
  features: z.array(z.string().trim().min(1)),
  challenges: z.array(z.string().trim().min(1)),
});
export type Project = z.infer<typeof projectSchema>;

export const projectsSchema = z.array(projectSchema).superRefine((projects, context) => {
  const seen = new Set<string>();
  projects.forEach((project, index) => {
    if (seen.has(project.slug)) {
      context.addIssue({ code: 'custom', message: `Duplicate slug "${project.slug}"`, path: [index, 'slug'] });
    }
    seen.add(project.slug);
  });
});

/* Career */

export const timelineEntrySchema = z.object({
  id: slug,
  title: required('Title'),
  org: required('Organization'),
  orgUrl: z.string().trim().optional(),
  start: required('Start'),
  end: z.string().trim().optional(),
  points: z.array(z.string().trim().min(1)),
  details: z
    .object({
      label: z.string().trim(),
      items: z.array(z.string().trim().min(1)),
    })
    .optional(),
  stack: z.array(z.string().trim().min(1)).optional(),
});
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;
export const timelineSchema = z.array(timelineEntrySchema);

/* Credentials */

/** A certification or course certificate. Kept flatter than a timeline entry: these are one line each. */
export const credentialSchema = z.object({
  id: slug,
  title: required('Title'),
  issuer: required('Issuer'),
  issuerUrl: z.string().trim().optional(),
  /** Free text, the same shape as timeline dates, for example "Nov 2022 - Aug 2024". */
  date: required('Date'),
  url: z.string().trim().optional(),
  note: z.string().trim().optional(),
});
export type Credential = z.infer<typeof credentialSchema>;
export const credentialsSchema = z.array(credentialSchema);

/* Skills */

export const skillGroupSchema = z.object({
  id: slug,
  title: required('Title'),
  items: z.array(z.string().trim().min(1)),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export const skillGroupsSchema = z.array(skillGroupSchema);

/* Navigation */

export const navigationSchema = z.object({
  projectGroups: z.array(
    z.object({
      title: required('Title'),
      slugs: z.array(z.string()),
    }),
  ),
  featured: z
    .object({
      slug: z.string(),
      eyebrow: z.string().trim(),
    })
    .optional(),
});
export type NavigationContent = z.infer<typeof navigationSchema>;

/* CV */

export const cvTemplateIds = ['classic', 'modern', 'sidebar'] as const;
export type CvTemplateId = (typeof cvTemplateIds)[number];

/** Every section a template can print. Listing them in settings controls both order and inclusion. */
export const cvSectionIds = [
  'experience',
  'selectedWork',
  'projects',
  'skills',
  'certifications',
  'activities',
  'education',
] as const;
export type CvSectionId = (typeof cvSectionIds)[number];

/** One printed skills row: a label and the skill groups whose items it gathers. */
export const cvSkillLineSchema = z.object({
  label: required('Label'),
  groups: z.array(z.string().trim().min(1)),
});
export type CvSkillLine = z.infer<typeof cvSkillLineSchema>;

/**
 * CV wording for one project. The site wants the fullest true sentence about a project; a CV wants
 * the one short line that matters to the role. Anything left out falls back to the project itself.
 */
export const cvProjectOverrideSchema = z.object({
  description: z.string().trim().optional(),
  highlight: z.string().trim().optional(),
  /** A short stack tag printed after the name, for example "RAG". */
  tag: z.string().trim().optional(),
  /** Renames the client shown after the name. An empty string hides it. */
  client: z.string().optional(),
  /**
   * Which link prints after the name. "own" (the default) prefers the project's own domain over
   * the portfolio page; "portfolio" always uses the portfolio page, for a project whose own domain
   * is a throwaway Vercel subdomain or reads better under the one bindev.me name on the page.
   */
  link: z.enum(['own', 'portfolio']).optional(),
});
export type CvProjectOverride = z.infer<typeof cvProjectOverrideSchema>;

export const cvSettingsSchema = z.object({
  template: z.enum(cvTemplateIds),
  /** Overrides the profile role on the CV, where there is room for a fuller description. */
  headline: z.string().trim().optional(),
  /** Overrides the profile summary, which also serves as the site's meta description. */
  summary: z.string().trim().optional(),
  /** Download name without the .pdf extension. */
  fileName: slug,
  /** Projects shown on the default CV, in order. */
  projectSlugs: z.array(z.string()),
  /** Per-project CV wording, keyed by slug. See cvProjectOverrideSchema. */
  projectOverrides: z.record(z.string(), cvProjectOverrideSchema).optional(),
  /** Tech ids to leave off the skills rows, for example an API style not worth the line. */
  skillOmit: z.array(z.string().trim().min(1)).optional(),
  /**
   * Tech to leave off every project's Tech line. Matched on the id or the display name, ignoring
   * case and spaces, so "tailwindcss" also drops "Tailwind CSS" but never "React Native".
   */
  stackOmit: z.array(z.string().trim().min(1)).optional(),
  /** Experience entries on the default CV, in order. Leaving it out uses every entry. */
  experienceIds: z.array(z.string()).optional(),
  /** Certifications shown on the default CV, in order. Leaving it out uses every one. */
  credentialIds: z.array(z.string()).optional(),
  /** Extracurricular entries shown on the default CV, in order. Leaving it out uses every one. */
  activityIds: z.array(z.string()).optional(),
  /** Sections to print, in this order. Leaving it out prints them all in their default order. */
  sections: z.array(z.enum(cvSectionIds)).optional(),
  /**
   * How skill groups collapse into printed rows. Without it the groups are packed automatically,
   * which produces unwieldy labels once there are more than a handful of them.
   */
  skillLines: z.array(cvSkillLineSchema).optional(),
});
export type CvSettings = z.infer<typeof cvSettingsSchema>;

/** A CV tailored for one application. Anything left out falls back to the default CV. */
export const cvVariantSchema = z.object({
  slug,
  label: required('Label'),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  template: z.enum(cvTemplateIds).optional(),
  headline: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  projectSlugs: z.array(z.string()).optional(),
  experienceIds: z.array(z.string()).optional(),
  credentialIds: z.array(z.string()).optional(),
  activityIds: z.array(z.string()).optional(),
  sections: z.array(z.enum(cvSectionIds)).optional(),
  skillLines: z.array(cvSkillLineSchema).optional(),
  projectOverrides: z.record(z.string(), cvProjectOverrideSchema).optional(),
  skillOmit: z.array(z.string().trim().min(1)).optional(),
  /**
   * Tech to leave off every project's Tech line. Matched on the id or the display name, ignoring
   * case and spaces, so "tailwindcss" also drops "Tailwind CSS" but never "React Native".
   */
  stackOmit: z.array(z.string().trim().min(1)).optional(),
  /** Skills to list first, in this order. */
  skills: z.array(z.string()).optional(),
  /** Extra bullet points keyed by experience or education id. */
  extraPoints: z.record(z.string(), z.array(z.string().trim().min(1))).optional(),
  notes: z.string().trim().optional(),
});
export type CvVariant = z.infer<typeof cvVariantSchema>;
