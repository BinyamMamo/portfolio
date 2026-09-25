/**
 * Turns stored content, plus an optional tailored variant, into the exact data a CV template renders.
 * Templates never read content files themselves, so every template shows the same information.
 */
import type {
  Credential,
  CvProjectOverride,
  CvSectionId,
  CvSettings,
  CvSkillLine,
  CvTemplateId,
  CvVariant,
  Profile,
  Project,
  SkillGroup,
  TimelineEntry,
} from '@/lib/schemas';
import { cvSectionIds } from '@/lib/schemas';
import { getTech } from '@/lib/tech';

export interface CvContent {
  profile: Profile;
  projects: Project[];
  experience: TimelineEntry[];
  education: TimelineEntry[];
  certifications: Credential[];
  activities: TimelineEntry[];
  skills: SkillGroup[];
  settings: CvSettings;
}

export interface CvLink {
  label: string;
  text: string;
  url: string;
}

export interface CvEntry {
  id: string;
  title: string;
  org: string;
  orgUrl?: string;
  period: string;
  points: string[];
  details?: { label: string; items: string[] };
  stack: string[];
}

export interface CvProject {
  name: string;
  description: string;
  highlight?: string;
  /** Set on work done for a company or team. */
  client?: string;
  /** A short stack tag printed after the name, for example "RAG". */
  tag?: string;
  year?: string;
  stack: string[];
  /** One link only: the live site where there is one, otherwise the public repository. */
  link?: CvLink;
}

export interface CvCredential {
  id: string;
  title: string;
  issuer: string;
  date: string;
  note?: string;
  url?: string;
}

export interface ResolvedCv {
  template: CvTemplateId;
  /** Which sections to print, in order. Templates walk this rather than hard-coding their own order. */
  sections: CvSectionId[];
  fileName: string;
  name: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  links: CvLink[];
  experience: CvEntry[];
  education: CvEntry[];
  certifications: CvCredential[];
  /** Clubs, volunteering and competitions. */
  activities: CvEntry[];
  /** Work built for companies and teams. */
  clientProjects: CvProject[];
  /** Everything built on my own. */
  projects: CvProject[];
  /** At most three comma-separated lines, so skills never crowd out the work. */
  skillLines: { label: string; items: string }[];
}

/** Keeps the order of `ids`, silently skipping ids that no longer exist. */
function pick<T>(items: T[], ids: string[] | undefined, key: (item: T) => string): T[] {
  if (!ids) return items;
  return ids.flatMap((id) => items.filter((item) => key(item) === id));
}

/** A wrapped tech line costs a whole line for the sake of a few names, so the tail is dropped. */
const MAX_STACK = 10;

/** Ignores case and spacing, so "Tailwind CSS" matches "tailwindcss" but "React Native" never matches "react". */
const normalize = (value: string) => value.toLowerCase().replace(/[\s.-]/g, '');

const stripProtocol = (url: string) =>
  url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

/** Generated hosting subdomains such as "hakim-web-zeta.vercel.app" read as throwaway on paper. */
const isGeneratedHost = (url: string) =>
  /\.(vercel|netlify|onrender|fly|pages|herokuapp|railway|github)\.(app|dev|io|com)$/i.test(
    stripProtocol(url).split('/')[0] ?? '',
  );

/**
 * One link per project. A project's own domain wins, because it is the shortest thing a reader can
 * type. Otherwise the portfolio page wins over the raw deployment: it carries the write-up and the
 * screenshots, and it keeps the CV on one domain instead of a list of generated subdomains.
 */
function projectLink(project: Project, siteUrl: string): CvLink | undefined {
  const own = [project.demo?.url, project.liveUrl].find((url) => url && !isGeneratedHost(url));
  if (own) return { label: 'Live', text: stripProtocol(own), url: own };

  // /p/<slug> is a rewrite of /projects/<slug>; the short form keeps the line readable on paper.
  const page = `${siteUrl.replace(/\/$/, '')}/p/${project.slug}`;
  if (project.demo?.url || project.liveUrl || project.repoUrl) {
    return { label: 'Details', text: stripProtocol(page), url: page };
  }
  return undefined;
}

function toProject(
  project: Project,
  siteUrl: string,
  override: CvProjectOverride = {},
  stackOmit: Set<string> = new Set(),
): CvProject {
  return {
    name: project.name,
    description: override.description ?? project.tagline,
    highlight: override.highlight ?? project.highlight,
    // Several products carry their client's name, and printing it twice reads like a mistake.
    client:
      override.client !== undefined
        ? override.client || undefined
        : project.kind === 'client' && project.client && project.client.name !== project.name
          ? project.client.name
          : undefined,
    tag: override.tag,
    year: project.year,
    stack: project.stack
      .filter((id) => !stackOmit.has(normalize(id)) && !stackOmit.has(normalize(getTech(id).name)))
      .slice(0, MAX_STACK)
      .map((id) => getTech(id).name),
    link: projectLink(project, siteUrl),
  };
}

/** "A", "A and B", "A, B and C". */
const joinTitles = (titles: string[]) =>
  titles.length < 3 ? titles.join(' and ') : `${titles.slice(0, -1).join(', ')} and ${titles.at(-1)}`;

/**
 * Collapses the skill groups into printed rows.
 *
 * With an explicit `skillLines` mapping, each row gathers the groups it names, so a row keeps a short
 * written label however many groups feed it. Without one the groups are packed into three rows and the
 * label is built from their titles, which only stays readable while there are few groups.
 */
function toSkillLines(
  groups: { id: string; title: string; items: string[] }[],
  mapping: CvSkillLine[] | undefined,
): { label: string; items: string }[] {
  const filled = groups.filter((group) => group.items.length > 0);

  if (mapping && mapping.length > 0) {
    const byId = new Map(filled.map((group) => [group.id, group]));
    return mapping
      .map((line) => ({
        label: line.label,
        items: line.groups.flatMap((id) => byId.get(id)?.items ?? []).join(', '),
      }))
      .filter((line) => line.items.length > 0);
  }

  const perLine = Math.ceil(filled.length / 3) || 1;
  const lines: { label: string; items: string }[] = [];
  for (let i = 0; i < filled.length; i += perLine) {
    const chunk = filled.slice(i, i + perLine);
    lines.push({
      // Plain words read naturally in lower case mid-sentence; names like "DevOps" or "AI" keep their casing.
      label: joinTitles(
        chunk.map((group, index) =>
          index === 0 || group.title.slice(1) !== group.title.slice(1).toLowerCase()
            ? group.title
            : group.title.toLowerCase(),
        ),
      ),
      items: chunk.flatMap((group) => group.items).join(', '),
    });
  }
  return lines.slice(0, 3);
}

function toEntry(entry: TimelineEntry, extraPoints: string[] = [], stackOmit: Set<string> = new Set()): CvEntry {
  return {
    id: entry.id,
    title: entry.title,
    org: entry.org,
    orgUrl: entry.orgUrl,
    // "Mon YYYY - Mon YYYY" is the shape ATS date parsers expect; the word "to" is read less reliably.
    period: entry.end ? `${entry.start} - ${entry.end}` : entry.start,
    points: [...entry.points, ...extraPoints],
    details: entry.details,
    stack: (entry.stack ?? [])
      .filter((id) => !stackOmit.has(normalize(id)) && !stackOmit.has(normalize(getTech(id).name)))
      .map((id) => getTech(id).name),
  };
}

export function resolveCv(content: CvContent, variant?: CvVariant): ResolvedCv {
  const { profile, settings } = content;
  const extra = variant?.extraPoints ?? {};
  const emphasized = (variant?.skills ?? []).map((skill) => skill.toLowerCase());
  const emphasisRank = (name: string) => {
    const index = emphasized.indexOf(name.toLowerCase());
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };

  // WhatsApp is a chat link, not something a recruiter reads on paper; the phone field covers it.
  const links: CvLink[] = [
    { label: 'Website', text: stripProtocol(profile.siteUrl), url: profile.siteUrl },
    ...profile.links
      .filter((link) => link.icon !== 'whatsapp')
      .map((link) => ({ label: link.label, text: link.handle || stripProtocol(link.url), url: link.url })),
  ];

  const chosen = pick(content.projects, variant?.projectSlugs ?? settings.projectSlugs, (project) => project.slug);
  const overrides = { ...settings.projectOverrides, ...variant?.projectOverrides };
  const stackOmit = new Set((variant?.stackOmit ?? settings.stackOmit ?? []).map(normalize));
  const build = (project: Project) => toProject(project, profile.siteUrl, overrides[project.slug], stackOmit);
  const omitted = new Set((variant?.skillOmit ?? settings.skillOmit ?? []).map((id) => id.toLowerCase()));

  return {
    template: variant?.template ?? settings.template,
    sections: variant?.sections ?? settings.sections ?? [...cvSectionIds],
    fileName: variant ? `${settings.fileName}-${variant.slug}` : settings.fileName,
    name: profile.name,
    headline: variant?.headline ?? settings.headline ?? profile.role,
    summary: variant?.summary ?? settings.summary ?? profile.summary,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    links,
    experience: pick(content.experience, variant?.experienceIds ?? settings.experienceIds, (entry) => entry.id).map(
      (entry) => toEntry(entry, extra[entry.id], stackOmit),
    ),
    education: content.education.map((entry) => toEntry(entry, extra[entry.id], stackOmit)),
    certifications: pick(content.certifications, variant?.credentialIds, (item) => item.id).map((item) => ({
      id: item.id,
      title: item.title,
      issuer: item.issuer,
      date: item.date,
      note: item.note,
      url: item.url ?? item.issuerUrl,
    })),
    activities: pick(content.activities, variant?.activityIds, (entry) => entry.id).map((entry) =>
      toEntry(entry, extra[entry.id]),
    ),
    clientProjects: chosen.filter((project) => project.kind === 'client').map(build),
    projects: chosen.filter((project) => project.kind !== 'client').map(build),
    skillLines: toSkillLines(
      content.skills.map((group) => ({
        id: group.id,
        title: group.title,
        items: group.items
          .filter((id) => !omitted.has(id.toLowerCase()))
          .map((id) => getTech(id).name)
          .sort((a, b) => emphasisRank(a) - emphasisRank(b)),
      })),
      variant?.skillLines ?? settings.skillLines,
    ),
  };
}
