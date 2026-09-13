import { featuredProjects } from '@/content/projects';
import type { NavEntry } from '@/lib/nav';

export const navigation: NavEntry[] = [
  {
    label: 'About',
    items: [
      { label: 'Skills', href: '/#skills', description: 'Languages, frameworks and tools I work with' },
      { label: 'Experience', href: '/#experience', description: 'Internship and engineering programs' },
      { label: 'Education', href: '/#education', description: 'Computer Engineering and ALX certification' },
    ],
  },
  {
    label: 'Projects',
    items: featuredProjects.map((project) => ({
      label: project.name,
      href: `/projects/${project.slug}`,
      description: project.tagline,
    })),
    footer: { label: 'All projects', href: '/projects' },
  },
  { label: 'Contact', href: '/#contact' },
];
