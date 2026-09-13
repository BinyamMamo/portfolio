import type { TechId } from '@/lib/tech';

interface MediaBase {
  alt: string;
  width: number;
  height: number;
}

export type ProjectMedia =
  | (MediaBase & { kind: 'video'; src: string; poster: string })
  | (MediaBase & { kind: 'image'; src: string });

export const projectCategories = ['Web', 'AI and Machine Learning', 'Data Visualization', 'Desktop'] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export interface Project {
  slug: string;
  name: string;
  /** One line, used in cards and menus. */
  tagline: string;
  /** Two or three sentences, used on featured rows and the detail page header. */
  summary: string;
  category: ProjectCategory;
  stack: TechId[];
  topics?: string[];
  highlight?: string;
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  cover?: ProjectMedia;
  gallery: ProjectMedia[];
  overview: string[];
  features: string[];
  challenges: string[];
}

// Media lives in /public/media/projects/<slug>/. Clips are MP4 with a WebP poster of the same name.
const video = (slug: string, file: string, alt: string, width: number, height: number): ProjectMedia => ({
  kind: 'video',
  src: `/media/projects/${slug}/${file}.mp4`,
  poster: `/media/projects/${slug}/${file}.webp`,
  alt,
  width,
  height,
});

const image = (slug: string, file: string, alt: string, width: number, height: number): ProjectMedia => ({
  kind: 'image',
  src: `/media/projects/${slug}/${file}.webp`,
  alt,
  width,
  height,
});

export const projects: Project[] = [
  {
    slug: 'certiscan',
    name: 'CertiScan',
    tagline: 'AI-assisted education attestation with real-time verification.',
    summary:
      'A web platform that streamlines education attestation using AI document analysis and digital twin verification, with real-time cross-checks against institutions and a dashboard-driven workflow.',
    category: 'Web',
    stack: ['react', 'vite', 'tailwindcss', 'azure'],
    topics: ['Document AI', 'Verification'],
    liveUrl: 'https://certiscan.vercel.app',
    repoUrl: 'https://github.com/BinyamMamo/certiscan',
    featured: true,
    cover: video('certiscan', 'analysis', 'Running AI analysis on an uploaded transcript', 1280, 652),
    gallery: [
      video('certiscan', 'verify', 'Verification flow', 1280, 634),
      video('certiscan', 'documentdetails', 'Document details view', 1280, 632),
      video('certiscan', 'analysis2', 'Extracted analysis results', 1280, 622),
      video('certiscan', 'chatbot', 'Assistant for attestation questions', 1280, 634),
      video('certiscan', 'chat2', 'Conversation with the assistant', 1280, 660),
      video('certiscan', 'admindashboard', 'Admin dashboard', 1280, 658),
    ],
    overview: [
      'CertiScan digitizes the education attestation process. Instead of moving paper documents between offices, applicants upload their certificates and transcripts and the platform analyzes them with AI.',
      'Each document is cross-verified with the issuing institution in real time using a digital twin approach, and predictive processing keeps applications moving. Applicants and administrators work from a clean, dashboard-driven interface.',
    ],
    features: [],
    challenges: [],
  },
  {
    slug: 'visionaid',
    name: 'VisionAid',
    tagline: 'Cross-platform assistant that helps visually impaired people navigate the world.',
    summary:
      'An accessibility app that combines computer vision, language processing and spatial audio to help visually impaired users read text, recognize objects and avoid hazards.',
    category: 'AI and Machine Learning',
    stack: ['flutter', 'firebase'],
    topics: ['Computer vision', 'OCR', 'Accessibility'],
    highlight: 'Built for the 19th IEEE Student Day competition with supervisors from the University of Dubai.',
    liveUrl: 'https://visionaid.vercel.app',
    repoUrl: 'https://github.com/orgs/VISUAL-AID/repositories',
    featured: true,
    cover: video('visionaid', 'visionaid', 'VisionAid landing page', 1280, 614),
    gallery: [
      video('visionaid', 'ocr', 'Text recognition with translation and summaries', 1254, 564),
      video('visionaid', 'object', 'Object detection with spatial audio guidance', 1280, 550),
      video('visionaid', 'scene', 'Scene description', 1280, 550),
      video('visionaid', 'hazard', 'Hazard detection with voice alerts', 1280, 550),
    ],
    overview: [
      'VisionAid helps visually impaired users interact with their surroundings more independently. The app provides real-time assistance for everyday navigation and reading tasks.',
      'It was developed for the 19th IEEE Student Day Competition as a collaboration between student developers and academic supervisors at the University of Dubai.',
      'The app combines computer vision, natural language processing and spatial audio into a single audio-first experience.',
    ],
    features: [
      'Real-time text scanning and recognition',
      'Arabic translation of recognized text',
      'AI-generated summaries for faster comprehension',
      'Object detection with spatial audio guidance',
      'Scene analysis with context-aware descriptions',
      'Hazard detection with immediate voice alerts',
      'Distance estimation for safer navigation',
      'Custom object training for personalized recognition',
    ],
    challenges: [
      'Running computer vision in real time on mobile devices',
      'Producing accurate spatial audio cues for object locations',
      'Supporting multiple languages, with a focus on Arabic',
      'Keeping models fast on mobile without losing accuracy',
      'Designing an interface that works entirely through audio',
    ],
  },
  {
    slug: 'funkey',
    name: 'Funkey',
    tagline: 'Learn to type with song lyrics, a piano mode and AI-generated practice.',
    summary:
      'A typing trainer that replaces dull drills with song lyrics, a piano-style keyboard mode and AI-generated practice text that adapts to your level.',
    category: 'Web',
    stack: ['react', 'nestjs', 'tailwindcss'],
    highlight: 'Selected as one of the top 5 capstone projects in the ALX Software Engineering program.',
    liveUrl: 'https://funkey-frontend.vercel.app',
    repoUrl: 'https://github.com/BinyamMamo/funkey-backend',
    featured: true,
    cover: video('funkey', 'browse', 'Browsing songs to type along with', 1280, 614),
    gallery: [
      video('funkey', 'practice', 'Practice mode', 1280, 614),
      video('funkey', 'piano', 'Piano typing mode', 1280, 612),
    ],
    overview: [
      'Funkey makes learning to type fun. Instead of repeating random words, you type along to real song lyrics, play a piano-style keyboard, or practice with AI-generated text that sounds familiar.',
      'It works for beginners learning the home row and for experienced typists chasing speed.',
    ],
    features: [
      'Lyrics-based typing practice using popular songs',
      'Piano-style keyboard mode for a musical typing experience',
      'AI-generated practice content that adapts to your skill level',
      'Real-time performance tracking and statistics',
      'Customizable practice sessions',
    ],
    challenges: [
      'Keeping the typing interface responsive across devices',
      'Synchronizing typing progress with song lyrics',
      'Generating practice content that fits the user and the context',
      'Handling rapid keystrokes without dropping updates',
    ],
  },
  {
    slug: 'peersphere',
    name: 'PeerSphere',
    tagline: 'Peer tutoring platform connecting university students with qualified tutors.',
    summary:
      'A peer tutoring platform with separate experiences for students, tutors and administrators, covering discovery, booking, session management and progress tracking.',
    category: 'Web',
    stack: ['react', 'vite', 'tailwindcss', 'reactRouter', 'javascript'],
    topics: ['Education'],
    liveUrl: 'https://peersphere.vercel.app',
    repoUrl: 'https://github.com/BinyamMamo/PeerSphere',
    featured: false,
    cover: video('peersphere', 'overview', 'Student dashboard and tutor booking', 1280, 664),
    gallery: [
      video('peersphere', 'admin', 'Administrator oversight tools', 1280, 664),
      image('peersphere', 'screenshot-1', 'PeerSphere dashboard', 1600, 830),
    ],
    overview: [
      'PeerSphere connects university students with qualified peer tutors, making academic support more accessible and affordable by drawing on the knowledge of fellow students.',
      'Students find and book sessions, tutors manage their availability and earnings, and administrators approve tutors and monitor platform activity. A demo mode lets you switch between roles to explore each one.',
    ],
    features: [
      'Role-based experience for students, tutors and administrators',
      'Tutor discovery and booking for students',
      'Session management with progress tracking',
      'Tutor availability management and earnings dashboard',
      'Tutor approval and session monitoring for administrators',
      'Platform analytics and performance metrics',
      'Demo mode with role switching',
    ],
    challenges: [
      'Designing three distinct experiences that still feel like one product',
      'Handling availability conflicts in the booking flow',
      'Managing shared state across multiple user roles',
      'Structuring the front end so a real backend can be added later',
    ],
  },
  {
    slug: 'mindwave',
    name: 'MindWave',
    tagline: 'Bite-sized, science-backed mental wellness in a scrollable feed.',
    summary:
      'A mobile-first wellness app that pairs micro-habits, quick relief tools and fractal progress visuals with a familiar vertical feed of 15 to 30 second interactions.',
    category: 'Web',
    stack: ['react', 'vite', 'tailwindcss', 'framerMotion', 'reactRouter'],
    topics: ['Health', 'Habits'],
    liveUrl: 'https://mindwaveuae.vercel.app',
    featured: false,
    cover: video('mindwave', 'overview', 'MindWave feed', 1280, 664),
    gallery: [
      video('mindwave', 'tools', 'Quick relief tools', 1280, 664),
      video('mindwave', 'habits', 'Habit tracking with fractal visualization', 1280, 664),
    ],
    overview: [
      'MindWave delivers science-backed approaches to mental wellness through short interactions designed for modern attention spans, presented in a vertical scrolling feed.',
      'Completing micro-habits grows a fractal visualization, giving users a visible sense of progress. All data stays in local storage, so the app needs no account and no backend.',
    ],
    features: [
      'Vertical feed of 15 to 30 second wellness exercises',
      'Guided micro-breathing and perspective reset visualizations',
      'Micro-habit builder with a growing fractal visualization',
      'Quick relief tools including a breathing pacer and color therapy',
      'Single-prompt journaling for focused reflection',
      'Habit streaks and completion history',
    ],
    challenges: [
      'Fitting meaningful exercises into 30 seconds or less',
      'Making feed scrolling feel as smooth as native social apps',
      'Designing visuals that respond to real user progress',
      'Keeping animations smooth on mobile devices',
      'Building a privacy-first app on local storage alone',
    ],
  },
  {
    slug: 'labaid',
    name: 'LabAId',
    tagline: 'Lightweight lab workflow assistant with camera-based search.',
    summary:
      'A React and Vite web app that assists with lab workflows through a camera-enabled search interface, built with a modular structure and tuned for fast load times.',
    category: 'Web',
    stack: ['react', 'vite', 'tailwindcss'],
    topics: ['Education'],
    liveUrl: 'https://lab-aid.vercel.app',
    repoUrl: 'https://github.com/BinyamMamo/lab-aid',
    featured: false,
    cover: video('labaid', 'overview', 'Camera-based search on mobile', 402, 826),
    gallery: [],
    overview: [
      'LabAId is a minimal app for lab workflows. Point your camera at equipment or materials to search for what you need.',
      'The project is built with a modular, developer-friendly structure, with minified builds and a streamlined ESLint setup to keep it fast and maintainable.',
    ],
    features: [],
    challenges: [],
  },
  {
    slug: 'manim-generator',
    name: 'Manim Video Generator',
    tagline: 'Describe a math animation in plain language and get a rendered video.',
    summary:
      'Creates mathematical animations from natural language descriptions by generating and rendering Manim scenes with Gemini.',
    category: 'AI and Machine Learning',
    stack: ['python', 'manim', 'gemini', 'mcp'],
    repoUrl: 'https://github.com/BinyamMamo/manim_generator',
    featured: false,
    gallery: [],
    overview: [
      'Manim Video Generator turns a plain language description into a mathematical animation. Gemini writes the Manim scene, and the tool renders it into a video.',
    ],
    features: [],
    challenges: [],
  },
  {
    slug: 'birthday-paradox',
    name: 'Birthday Paradox Simulator',
    tagline: 'Interactive simulations that make a counterintuitive probability result click.',
    summary:
      'An interactive web app that demonstrates the Birthday Paradox with real-time simulations, convergence charts and a full probability curve.',
    category: 'Data Visualization',
    stack: ['react', 'recharts', 'javascript'],
    topics: ['Probability', 'Statistics'],
    liveUrl: 'https://birthday-paradox.vercel.app',
    repoUrl: 'https://github.com/BinyamMamo/birthday_paradox',
    featured: false,
    cover: video('birthday-paradox', 'overview', 'Running birthday paradox simulations', 1280, 664),
    gallery: [
      image('birthday-paradox', 'screenshot-1', 'Simulation controls and generated rooms', 1600, 834),
      image('birthday-paradox', 'screenshot-2', 'Probability convergence and paradox curve charts', 1600, 834),
    ],
    overview: [
      'In a room of just 23 people there is roughly a 50% chance that two share a birthday. Most people find that hard to believe, so this simulator lets you watch it happen.',
      'You can run many simulations with different parameters and see empirical results converge on the theoretical probability. One chart tracks convergence over iterations, and another plots the probability for every group size.',
      'The same idea shows up in computer science, in hash collisions and cryptographic attacks.',
    ],
    features: [
      'Controls for group size and number of simulated rooms',
      'Real-time simulation with matching birthdays highlighted',
      'Convergence chart and full paradox curve',
      'Room view showing individual birthdays and matches',
      'Statistics on iterations, matches and deviation from theory',
      'Continuous simulation mode',
    ],
    challenges: [
      'Computing accurate probabilities for large groups',
      'Updating charts in real time without slowing the page',
      'Presenting the math in a way that is easy to follow',
    ],
  },
  {
    slug: 'chess-turtle',
    name: 'Chess Turtle',
    tagline: 'A chessboard drawer and playable chess game with AI, in pure Python.',
    summary:
      'Combines turtle graphics and Tkinter into two connected apps: a themeable chessboard drawer and a full chess game with three AI difficulty levels.',
    category: 'Desktop',
    stack: ['python', 'tkinter', 'turtle'],
    topics: ['Game AI'],
    repoUrl: 'https://github.com/BinyamMamo/chess_turtle',
    featured: false,
    cover: video('chess-turtle', 'overview', 'Drawing a chessboard and playing a game', 1008, 876),
    gallery: [
      image('chess-turtle', 'screenshot-2', 'Chessboard drawer with theme options', 751, 950),
      image('chess-turtle', 'screenshot-1', 'Chess game against the AI', 805, 878),
    ],
    overview: [
      "Chess Turtle shows how far Python's built-in libraries can go. It pairs a turtle graphics chessboard drawer, with adjustable sizes and color themes, with a complete chess game built in Tkinter.",
      'The AI opponent evaluates positions using piece values, board control and tactical positioning, across easy, normal and hard difficulty levels.',
    ],
    features: [
      'Chessboard drawer with multiple color themes and sizes',
      'Playable chess game with a Tkinter interface',
      'AI opponent with easy, normal and hard levels',
      'Move validation and rule enforcement',
      'Highlighting of valid moves for the selected piece',
      'Move history',
    ],
    challenges: [
      'Implementing complete chess rules and move validation',
      'Tuning the AI to feel different at each difficulty',
      'Making turtle graphics and Tkinter work together in one app',
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
