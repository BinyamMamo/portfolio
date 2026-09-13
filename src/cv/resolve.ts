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
  stack: string[];
  links: CvLink[];
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
  projects: CvProject[];
  skills: { title: string; items: string[] }[];
}

/** Keeps the order of `ids`, silently skipping ids that no longer exist. */
function pick<T>(items: T[], ids: string[] | undefined, key: (item: T) => string): T[] {
  if (!ids) return items;
  return ids.flatMap((id) => items.filter((item) => key(item) === id));
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

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

  return {
    template: variant?.template ?? settings.template,
    fileName: variant ? `${settings.fileName}-${variant.slug}` : settings.fileName,
    name: profile.name,
    headline: variant?.headline ?? profile.role,
    summary: variant?.summary ?? profile.summary,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    links,
    experience: pick(content.experience, variant?.experienceIds, (entry) => entry.id).map((entry) =>
      toEntry(entry, extra[entry.id]),
    ),
    education: content.education.map((entry) => toEntry(entry, extra[entry.id])),
    projects: pick(content.projects, variant?.projectSlugs ?? settings.projectSlugs, (project) => project.slug).map(
      (project) => ({
        name: project.name,
        description: project.tagline,
        highlight: project.highlight,
        stack: project.stack.map((id) => getTech(id).name),
        links: [
          ...(project.liveUrl ? [{ label: 'Live', text: stripProtocol(project.liveUrl), url: project.liveUrl }] : []),
          ...(project.repoUrl ? [{ label: 'Code', text: stripProtocol(project.repoUrl), url: project.repoUrl }] : []),
        ],
      }),
    ),
    skills: content.skills.map((group) => ({
      title: group.title,
      items: group.items
        .map((id) => getTech(id).name)
        .sort((a, b) => emphasisRank(a) - emphasisRank(b)),
    })),
  };
}
