/**
 * Turns stored content, plus an optional tailored variant, into the exact data a CV template renders.
 * Templates never read content files themselves, so every template shows the same information.
 */
import type {
  CvSettings,
  CvTemplateId,
  CvVariant,
  Profile,
  Project,
  SkillGroup,
  TimelineEntry,
} from '@/lib/schemas';
import { getTech } from '@/lib/tech';

export interface CvContent {
  profile: Profile;
  projects: Project[];
  experience: TimelineEntry[];
  education: TimelineEntry[];
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
  year?: string;
  stack: string[];
  /** One link only: the live site where there is one, otherwise the public repository. */
  link?: CvLink;
}

export interface ResolvedCv {
  template: CvTemplateId;
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

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

/** A live site says more to a reader than a repository, so it wins when a project has both. */
function projectLink(project: Project): CvLink | undefined {
  if (project.demo?.url) return { label: 'Demo', text: stripProtocol(project.demo.url), url: project.demo.url };
  if (project.liveUrl) return { label: 'Live', text: stripProtocol(project.liveUrl), url: project.liveUrl };
  if (project.repoUrl) return { label: 'Code', text: stripProtocol(project.repoUrl), url: project.repoUrl };
  return undefined;
}

function toProject(project: Project): CvProject {
  return {
    name: project.name,
    description: project.tagline,
    highlight: project.highlight,
    // Several products carry their client's name, and printing it twice reads like a mistake.
    client: project.kind === 'client' && project.client && project.client.name !== project.name ? project.client.name : undefined,
    year: project.year,
    stack: project.stack.map((id) => getTech(id).name),
    link: projectLink(project),
  };
}

/** "A", "A and B", "A, B and C". */
const joinTitles = (titles: string[]) =>
  titles.length < 3 ? titles.join(' and ') : `${titles.slice(0, -1).join(', ')} and ${titles.at(-1)}`;

/** Packs the skill groups into at most three lines, keeping their order. */
function toSkillLines(groups: { title: string; items: string[] }[]): { label: string; items: string }[] {
  const filled = groups.filter((group) => group.items.length > 0);
  const perLine = Math.ceil(filled.length / 3) || 1;
  const lines: { label: string; items: string }[] = [];
  for (let i = 0; i < filled.length; i += perLine) {
    const chunk = filled.slice(i, i + perLine);
    lines.push({
      // Plain words read naturally in lower case mid-sentence; names like "DevOps" or "AI" keep their casing.
      label: joinTitles(
        chunk.map((group, index) =>
          index === 0 || group.title.slice(1) !== group.title.slice(1).toLowerCase() ? group.title : group.title.toLowerCase(),
        ),
      ),
      items: chunk.flatMap((group) => group.items).join(', '),
    });
  }
  return lines.slice(0, 3);
}

function toEntry(entry: TimelineEntry, extraPoints: string[] = []): CvEntry {
  return {
    id: entry.id,
    title: entry.title,
    org: entry.org,
    orgUrl: entry.orgUrl,
    period: entry.end ? `${entry.start} to ${entry.end}` : entry.start,
    points: [...entry.points, ...extraPoints],
    details: entry.details,
    stack: (entry.stack ?? []).map((id) => getTech(id).name),
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

  return {
    template: variant?.template ?? settings.template,
    fileName: variant ? `${settings.fileName}-${variant.slug}` : settings.fileName,
    name: profile.name,
    headline: variant?.headline ?? settings.headline ?? profile.role,
    summary: variant?.summary ?? profile.summary,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    links,
    experience: pick(content.experience, variant?.experienceIds, (entry) => entry.id).map((entry) =>
      toEntry(entry, extra[entry.id]),
    ),
    education: content.education.map((entry) => toEntry(entry, extra[entry.id])),
    clientProjects: chosen.filter((project) => project.kind === 'client').map(toProject),
    projects: chosen.filter((project) => project.kind !== 'client').map(toProject),
    skillLines: toSkillLines(
      content.skills.map((group) => ({
        title: group.title,
        items: group.items.map((id) => getTech(id).name).sort((a, b) => emphasisRank(a) - emphasisRank(b)),
      })),
    ),
  };
}
