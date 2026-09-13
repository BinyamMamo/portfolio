import type { TechId } from '@/lib/tech';

export interface TimelineEntry {
  title: string;
  org: string;
  orgUrl?: string;
  start: string;
  end?: string;
  points: string[];
  details?: { label: string; items: string[] };
  stack?: TechId[];
}

export const experience: TimelineEntry[] = [
  {
    title: 'ProDev Back-End Program',
    org: 'ALX Africa',
    orgUrl: 'https://www.alxafrica.com',
    start: 'Jan 2025',
    end: 'Present',
    points: [
      'Advanced back-end track covering Django, GraphQL APIs, containerization and CI/CD pipelines.',
    ],
    stack: ['django', 'graphql', 'docker', 'kubernetes'],
  },
  {
    title: 'Backend Intern',
    org: 'Kuraztech',
    orgUrl: 'https://kuraztech.com',
    start: 'Jul 2024',
    end: 'Sep 2024',
    points: [
      'Built features for an internship management system and a price comparison platform.',
      'Worked in a Laravel codebase with Bootstrap and Tailwind CSS on the front end, planning work in Trello.',
    ],
    stack: ['laravel', 'javascript', 'bootstrap', 'tailwindcss', 'github', 'trello'],
  },
];

export const education: TimelineEntry[] = [
  {
    title: 'BSc Computer Engineering',
    org: 'University of Dubai',
    orgUrl: 'https://ud.ac.ae',
    start: 'Aug 2023',
    end: 'May 2027',
    points: [
      'GPA 3.99, on a full scholarship awarded for academic excellence.',
      'Taking part in AI research projects alongside coursework.',
    ],
    details: {
      label: 'Coursework',
      items: [
        'Data Structures and Algorithms',
        'Computer Architecture',
        'Artificial Intelligence',
        'Software Engineering',
        'Object-Oriented Programming with Java',
      ],
    },
  },
  {
    title: 'Software Engineering Certification, Back-End',
    org: 'ALX Africa (Holberton School)',
    orgUrl: 'https://www.alxafrica.com',
    start: 'Nov 2022',
    end: 'Aug 2024',
    points: [
      'Intensive 12-month program, 70+ hours a week, covering C, Python, DevOps and full-stack development.',
      'Capstone project Funkey was selected as one of the top 5 projects in the program.',
    ],
    details: {
      label: 'Covered',
      items: ['Flask', 'MongoDB', 'MySQL', 'Bash', 'Nginx', 'Docker', 'System design', 'API development'],
    },
  },
  {
    title: 'BSc Computer Science',
    org: 'Addis Ababa University',
    start: 'Jan 2022',
    end: 'Aug 2023',
    points: [
      'Completed two semesters, finishing the first in the top 5% of the class.',
      'Transferred after receiving a full scholarship to the University of Dubai.',
    ],
  },
];
