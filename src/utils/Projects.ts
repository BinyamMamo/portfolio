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
        alt: 'Project Web Design',
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
      id: 'ecommerce',
      name: 'E-Commerce',
      description:
        'A full-stack e-commerce solution with real-time inventory management, payment processing, and advanced analytics dashboard.',
      link: '/',
      repoLink: 'https://github.com/yourusername/ecommerce',
      img: {
        src: '/assets/images/piano.gif',
        alt: 'E-Commerce Platform',
      },
      category: 'Web Development',
      tags: [
        { text: 'Next.js', color: ColorTags.VIOLET },
        { text: 'Stripe', color: ColorTags.EMERALD },
        { text: 'JavaScript', color: ColorTags.YELLOW },
      ],
      featured: true,
    },
    {
      id: 'ai-chat',
      name: 'AI Chat Assistant',
      description:
        'An intelligent chat assistant powered by machine learning that can understand context and provide relevant responses.',
      link: '/',
      repoLink: 'https://github.com/yourusername/ai-chat',
      img: {
        src: '/assets/images/practice.gif',
        alt: 'AI Chat Assistant',
      },
      category: 'AI & Machine Learning',
      tags: [
        { text: 'Python', color: ColorTags.FUCHSIA },
        { text: 'TensorFlow', color: ColorTags.INDIGO },
        { text: 'React', color: ColorTags.ROSE },
      ],
      featured: true,
    },
    {
      id: 'data-visualization',
      name: 'Data Visualization Dashboard',
      description:
        'Interactive dashboard for visualizing complex datasets with multiple chart types and filtering options.',
      link: '/',
      repoLink: 'https://github.com/yourusername/data-viz',
      img: {
        src: '/assets/images/browse.gif',
        alt: 'Data Visualization Dashboard',
      },
      category: 'Data Science',
      tags: [
        { text: 'D3.js', color: ColorTags.ORANGE },
        { text: 'React', color: ColorTags.ROSE },
        { text: 'Python', color: ColorTags.FUCHSIA },
      ],
      featured: false,
    },
    {
      id: 'mobile-app',
      name: 'Fitness Tracker App',
      description:
        'Mobile application for tracking workouts, nutrition, and fitness progress with personalized recommendations.',
      link: '/',
      repoLink: 'https://github.com/yourusername/fitness-app',
      img: {
        src: '/assets/images/piano.gif',
        alt: 'Fitness App',
      },
      category: 'Mobile Development',
      tags: [
        { text: 'React Native', color: ColorTags.BLUE },
        { text: 'Firebase', color: ColorTags.YELLOW },
        { text: 'TypeScript', color: ColorTags.ROSE },
      ],
      featured: false,
    },
    {
      id: 'iot-project',
      name: 'Smart Home System',
      description:
        'IoT-based smart home automation system with voice control, scheduling, and energy management features.',
      link: '/',
      repoLink: 'https://github.com/yourusername/smart-home',
      img: {
        src: '/assets/images/piano.gif',
        alt: 'Smart Home System',
      },
      category: 'IoT',
      tags: [
        { text: 'Raspberry Pi', color: ColorTags.RED },
        { text: 'Node.js', color: ColorTags.GREEN },
        { text: 'MQTT', color: ColorTags.BLUE },
      ],
      featured: false,
    },
    {
      id: 'devops-tool',
      name: 'Continuous Integration Pipeline',
      description:
        'Automated CI/CD pipeline for software deployment with testing, building, and monitoring capabilities.',
      link: '/',
      repoLink: 'https://github.com/yourusername/ci-pipeline',
      img: {
        src: '/assets/images/practice.gif',
        alt: 'CI Pipeline',
      },
      category: 'DevOps',
      tags: [
        { text: 'Docker', color: ColorTags.BLUE },
        { text: 'Jenkins', color: ColorTags.RED },
        { text: 'Kubernetes', color: ColorTags.BLUE },
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
