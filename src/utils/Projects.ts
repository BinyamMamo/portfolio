import { ColorTags } from 'astro-boilerplate-components';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  link: string;
  repoLink?: string;
  img: {
    src: string;
    alt: string;
  };
  category: string;
  tags: {
    text: string;
    color: string;
  }[];
  featured: boolean;
}

export const getAllProjects = (): ProjectData[] => {
  return [
    {
      id: 'funkey',
      name: 'Funkey',
      description:
        'Learn Typing having the most fun. Explore features like lyrics typing, piano typing and practice typing with AI generated contents that sound familiar.',
      link: '/',
      repoLink: 'https://github.com/yourusername/funkey',
      img: {
        src: '/assets/images/browse.gif',
        alt: 'Funkey typing interface',
      },
      category: 'Web Development',
      tags: [
        { text: 'Bootstrap', color: ColorTags.FUCHSIA },
        { text: 'MongoDB', color: ColorTags.LIME },
        { text: 'Express', color: ColorTags.SKY },
        { text: 'TypeScript', color: ColorTags.ROSE },
      ],
      featured: true,
    },
    {
      id: 'visionaid',
      name: 'VisionAid',
      description:
        'An AI-powered accessibility application designed to assist visually impaired individuals through advanced computer vision and natural language processing technologies.',
      link: '/',
      repoLink: 'https://github.com/yourusername/visionaid',
      img: {
        src: '/assets/images/visionaid/visionaid.gif',
        alt: 'VisionAid accessibility interface',
      },
      category: 'AI & Machine Learning',
      tags: [
        { text: 'Computer Vision', color: ColorTags.INDIGO },
        { text: 'NLP', color: ColorTags.PURPLE },
        { text: 'Mobile Development', color: ColorTags.BLUE },
        { text: 'Accessibility', color: ColorTags.EMERALD },
      ],
      featured: true,
    },
    {
      id: 'peersphere',
      name: 'PeerSphere',
      description:
        'A peer tutoring platform that connects university students with qualified peer tutors, featuring session management and progress tracking.',
      link: '/',
      repoLink: 'https://github.com/BinyamMamo/peersphere',
      img: {
        src: '/assets/images/peersphere/peersphere.gif',
        alt: 'PeerSphere tutoring platform',
      },
      category: 'Web Development',
      tags: [
        { text: 'React', color: ColorTags.ROSE },
        { text: 'Vite', color: ColorTags.VIOLET },
        { text: 'Context API', color: ColorTags.YELLOW },
        { text: 'Education', color: ColorTags.EMERALD },
      ],
      featured: false,
    },
    {
      id: 'mindwave',
      name: 'MindWave',
      description:
        'A mobile-first web application that delivers science-backed approaches to mental wellness through engaging, bite-sized interactions with TikTok-like scrollable interface.',
      link: '/',
      repoLink: 'https://github.com/BinyamMamo/mindwave',
      img: {
        src: '/assets/images/mindwave/mindwave.gif',
        alt: 'MindWave mental wellness app',
      },
      category: 'Web Development',
      tags: [
        { text: 'React', color: ColorTags.ROSE },
        { text: 'Vite', color: ColorTags.VIOLET },
        { text: 'Tailwind CSS', color: ColorTags.SKY },
        { text: 'Mental Health', color: ColorTags.EMERALD },
      ],
      featured: true,
    },
    {
      id: 'birthday-paradox',
      name: 'Birthday Paradox Simulator',
      description:
        'An interactive web application that demonstrates the Birthday Paradox through real-time simulations and probability visualizations.',
      link: '/',
      repoLink: 'https://github.com/BinyamMamo/birthday_paradox',
      img: {
        src: '/assets/images/birthday-paradox/birthday-paradox.gif',
        alt: 'Birthday Paradox visualization',
      },
      category: 'Data Science',
      tags: [
        { text: 'React', color: ColorTags.ROSE },
        { text: 'Recharts', color: ColorTags.ORANGE },
        { text: 'Probability', color: ColorTags.INDIGO },
        { text: 'Mathematics', color: ColorTags.PURPLE },
      ],
      featured: false,
    },
    {
      id: 'chess-turtle',
      name: 'Chess Turtle',
      description:
        'A Python project combining turtle graphics and tkinter to create a chessboard drawer and playable chess game with AI support.',
      link: '/',
      repoLink: 'https://github.com/BinyamMamo/chess_turtle',
      img: {
        src: '/assets/images/chess-turtle/chess-turtle.gif',
        alt: 'Chess Turtle game interface',
      },
      category: 'Desktop Application',
      tags: [
        { text: 'Python', color: ColorTags.FUCHSIA },
        { text: 'Turtle Graphics', color: ColorTags.GREEN },
        { text: 'Tkinter', color: ColorTags.BLUE },
        { text: 'Game AI', color: ColorTags.INDIGO },
      ],
      featured: false,
    },
  ];
};

export const getProjectCategories = (): string[] => {
  const projects = getAllProjects();
  const categories = new Set(projects.map((project) => project.category));
  return Array.from(categories);
};

export const getFeaturedProjects = (): ProjectData[] => {
  return getAllProjects().filter((project) => project.featured);
};

export const getProjectById = (id: string): ProjectData | undefined => {
  return getAllProjects().find((project) => project.id === id);
};

export const getProjectsByCategory = (category: string): ProjectData[] => {
  return getAllProjects().filter((project) => project.category === category);
};
