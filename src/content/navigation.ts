import { getProject, type Project, projects } from '@/content/projects';
import type { NavEntry, NavLink } from '@/lib/nav';

function requireProject(slug: string): Project {
  const project = getProject(slug);
  if (!project) throw new Error(`Unknown project slug in navigation: ${slug}`);
  return project;
}

function projectLink(slug: string): NavLink {
  const project = requireProject(slug);
  return { label: project.name, href: `/projects/${project.slug}`, description: project.tagline };
}

const projectGroups = [
  { title: 'AI and computer vision', slugs: ['visionaid', 'certiscan', 'labaid', 'manim-generator'] },
  { title: 'Web platforms', slugs: ['funkey', 'peersphere', 'mindwave'] },
  { title: 'Simulations and games', slugs: ['birthday-paradox', 'chess-turtle'] },
];

const featured = requireProject('funkey');
const featuredCover = featured.cover;

export const navigation: NavEntry[] = [
  {
    label: 'Projects',
    groups: projectGroups.map((group) => ({ title: group.title, items: group.slugs.map(projectLink) })),
    featured: featuredCover && {
      eyebrow: 'Top 5 at ALX',
      label: featured.name,
      href: `/projects/${featured.slug}`,
      description: featured.tagline,
      image: featuredCover.kind === 'video' ? featuredCover.poster : featuredCover.src,
    },
    footer: {
      label: 'All projects',
      href: '/projects',
      description: `${projects.length} projects across web, AI and desktop`,
    },
  },
  { label: 'Skills', href: '/#skills' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Education', href: '/#education' },
  { label: 'Contact', href: '/#contact' },
];
