/** A logo file in /public/icons. `iconDark` is used instead when the dark theme is active. */
export interface LogoSource {
  icon: string;
  iconDark?: string;
}

export interface Tech {
  name: string;
  logo?: LogoSource;
}

const logo = (icon: string, iconDark?: string): LogoSource => ({
  icon: `/icons/${icon}.svg`,
  iconDark: iconDark ? `/icons/${iconDark}.svg` : undefined,
});

/** Every technology referenced anywhere on the site. Logos come from svgl.app and Wikimedia Commons. */
export const tech = {
  javascript: { name: 'JavaScript', logo: logo('javascript') },
  python: { name: 'Python', logo: logo('python') },
  cpp: { name: 'C++', logo: logo('cpp') },
  java: { name: 'Java', logo: logo('java') },
  bash: { name: 'Bash', logo: logo('bash', 'bash-dark') },

  nodejs: { name: 'Node.js', logo: logo('nodejs') },
  express: { name: 'Express', logo: logo('express', 'express-dark') },
  nestjs: { name: 'NestJS', logo: logo('nestjs') },
  flask: { name: 'Flask', logo: logo('flask', 'flask-dark') },
  django: { name: 'Django', logo: logo('django') },
  laravel: { name: 'Laravel', logo: logo('laravel') },
  graphql: { name: 'GraphQL', logo: logo('graphql') },

  mongodb: { name: 'MongoDB', logo: logo('mongodb', 'mongodb-dark') },
  mysql: { name: 'MySQL', logo: logo('mysql', 'mysql-dark') },
  postgresql: { name: 'PostgreSQL', logo: logo('postgresql') },
  firebase: { name: 'Firebase', logo: logo('firebase') },

  react: { name: 'React', logo: logo('react', 'react-dark') },
  reactRouter: { name: 'React Router', logo: logo('reactrouter') },
  tailwindcss: { name: 'Tailwind CSS', logo: logo('tailwindcss') },
  bootstrap: { name: 'Bootstrap', logo: logo('bootstrap') },
  jquery: { name: 'jQuery', logo: logo('jquery', 'jquery-dark') },
  vite: { name: 'Vite', logo: logo('vite') },
  framerMotion: { name: 'Framer Motion', logo: logo('framer', 'framer-dark') },
  recharts: { name: 'Recharts' },
  flutter: { name: 'Flutter', logo: logo('flutter') },

  docker: { name: 'Docker', logo: logo('docker') },
  kubernetes: { name: 'Kubernetes', logo: logo('kubernetes') },
  nginx: { name: 'Nginx', logo: logo('nginx') },
  git: { name: 'Git', logo: logo('git') },
  github: { name: 'GitHub', logo: logo('github', 'github-dark') },
  linux: { name: 'Linux', logo: logo('linux') },
  trello: { name: 'Trello', logo: logo('trello') },
  azure: { name: 'Azure', logo: logo('azure') },

  gemini: { name: 'Gemini', logo: logo('gemini') },
  manim: { name: 'Manim' },
  colab: { name: 'Google Colab', logo: logo('colab') },
  mcp: { name: 'MCP', logo: logo('mcp', 'mcp-dark') },
  tkinter: { name: 'Tkinter' },
  turtle: { name: 'Turtle Graphics' },
} satisfies Record<string, Tech>;

export type TechId = keyof typeof tech;

export const techIds = Object.keys(tech) as TechId[];

export function isTechId(value: string): value is TechId {
  return Object.hasOwn(tech, value);
}

/** Looks up a registered technology. Unknown names (custom skills) come back as a name without a logo. */
export function getTech(id: string): Tech {
  return isTechId(id) ? tech[id] : { name: id };
}
