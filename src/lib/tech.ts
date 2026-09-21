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

/** Every technology referenced anywhere on the site. Logos come from svgl.app, Simple Icons, Wikimedia Commons, project sites and Lucide. */
export const tech = {
  javascript: { name: 'JavaScript', logo: logo('javascript') },
  typescript: { name: 'TypeScript', logo: logo('typescript') },
  python: { name: 'Python', logo: logo('python') },
  cpp: { name: 'C++', logo: logo('cpp') },
  java: { name: 'Java', logo: logo('java') },
  bash: { name: 'Bash', logo: logo('bash', 'bash-dark') },

  nodejs: { name: 'Node.js', logo: logo('nodejs') },
  express: { name: 'Express', logo: logo('express', 'express-dark') },
  nestjs: { name: 'NestJS', logo: logo('nestjs') },
  fastapi: { name: 'FastAPI', logo: logo('fastapi') },
  zod: { name: 'Zod', logo: logo('zod') },
  stripe: { name: 'Stripe', logo: logo('stripe') },
  flask: { name: 'Flask', logo: logo('flask', 'flask-dark') },
  django: { name: 'Django', logo: logo('django') },
  laravel: { name: 'Laravel', logo: logo('laravel') },
  graphql: { name: 'GraphQL', logo: logo('graphql') },

  mongodb: { name: 'MongoDB', logo: logo('mongodb', 'mongodb-dark') },
  mysql: { name: 'MySQL', logo: logo('mysql', 'mysql-dark') },
  postgresql: { name: 'PostgreSQL', logo: logo('postgresql') },
  firebase: { name: 'Firebase', logo: logo('firebase') },
  supabase: { name: 'Supabase', logo: logo('supabase') },
  prisma: { name: 'Prisma', logo: logo('prisma', 'prisma-dark') },
  influxdb: { name: 'InfluxDB', logo: logo('influxdb') },

  react: { name: 'React', logo: logo('react', 'react-dark') },
  reactRouter: { name: 'React Router', logo: logo('reactrouter') },
  nextjs: { name: 'Next.js', logo: logo('nextjs') },
  tanstackQuery: { name: 'TanStack Query', logo: logo('tanstack', 'tanstack-dark') },
  zustand: { name: 'Zustand', logo: { icon: '/icons/zustand.png' } },
  tailwindcss: { name: 'Tailwind CSS', logo: logo('tailwindcss') },
  bootstrap: { name: 'Bootstrap', logo: logo('bootstrap') },
  jquery: { name: 'jQuery', logo: logo('jquery', 'jquery-dark') },
  vite: { name: 'Vite', logo: logo('vite') },
  framerMotion: { name: 'Framer Motion', logo: logo('framer', 'framer-dark') },
  recharts: { name: 'Recharts' },
  flutter: { name: 'Flutter', logo: logo('flutter') },

  docker: { name: 'Docker', logo: logo('docker') },
  githubActions: { name: 'GitHub Actions', logo: logo('github-actions') },
  vercel: { name: 'Vercel', logo: logo('vercel', 'vercel-dark') },
  render: { name: 'Render', logo: logo('render', 'render-dark') },
  cloudflareWorkers: { name: 'Cloudflare Workers', logo: logo('cloudflare') },
  rest: { name: 'REST', logo: logo('rest') },
  socketio: { name: 'Socket.IO', logo: logo('socketio', 'socketio-dark') },
  openapi: { name: 'OpenAPI', logo: logo('swagger') },
  raycast: { name: 'Raycast', logo: logo('raycast') },
  kubernetes: { name: 'Kubernetes', logo: logo('kubernetes') },
  nginx: { name: 'Nginx', logo: logo('nginx') },
  git: { name: 'Git', logo: logo('git') },
  github: { name: 'GitHub', logo: logo('github', 'github-dark') },
  linux: { name: 'Linux', logo: logo('linux') },
  trello: { name: 'Trello', logo: logo('trello') },
  azure: { name: 'Azure', logo: logo('azure') },

  pytorch: { name: 'PyTorch', logo: logo('pytorch') },
  opencv: { name: 'OpenCV', logo: logo('opencv') },
  gemini: { name: 'Gemini', logo: logo('gemini') },
  ollama: { name: 'Ollama', logo: logo('ollama', 'ollama-dark') },
  openclaw: { name: 'OpenClaw', logo: logo('openclaw') },
  hermes: { name: 'Hermes' },
  rag: { name: 'RAG', logo: logo('rag') },
  chromeExtensions: { name: 'Chrome extensions', logo: logo('chrome') },
  vscodeExtensions: { name: 'VS Code extensions', logo: logo('vscode') },
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
