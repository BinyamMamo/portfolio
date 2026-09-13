import type { TechId } from '@/lib/tech';

export interface SkillGroup {
  title: string;
  items: TechId[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    items: ['javascript', 'python', 'cpp', 'java', 'bash'],
  },
  {
    title: 'Backend',
    items: ['nodejs', 'express', 'nestjs', 'flask', 'django', 'laravel', 'graphql'],
  },
  {
    title: 'Databases',
    items: ['mongodb', 'mysql', 'postgresql', 'firebase'],
  },
  {
    title: 'Frontend',
    items: ['react', 'tailwindcss', 'bootstrap', 'jquery'],
  },
  {
    title: 'Tools and infrastructure',
    items: ['git', 'github', 'linux', 'docker', 'kubernetes', 'nginx', 'trello'],
  },
];
