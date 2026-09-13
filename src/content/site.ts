import { type LogoSource, tech } from '@/lib/tech';

export interface SocialLink {
  label: string;
  /** Short text shown under the label in menus. */
  handle: string;
  href: string;
  logo: LogoSource;
}

export const site = {
  name: 'Binyam Mamo',
  role: 'Backend Developer',
  location: 'Dubai, UAE',
  url: 'https://binyammamo.vercel.app',
  email: 'binyammamo01@gmail.com',
  resume: '/binyam-mamo-cv.pdf',
  description:
    'Backend developer certified by ALX and Computer Engineering student at the University of Dubai, building web platforms and AI-powered tools.',
  socials: [
    {
      label: 'GitHub',
      handle: 'github.com/BinyamMamo',
      href: 'https://github.com/BinyamMamo',
      logo: tech.github.logo,
    },
    {
      label: 'LinkedIn',
      handle: 'linkedin.com/in/binyammamo',
      href: 'https://www.linkedin.com/in/binyammamo',
      logo: { icon: '/icons/linkedin.svg' },
    },
    {
      label: 'WhatsApp',
      handle: 'Message me directly',
      href: 'https://wa.me/971568784063',
      logo: { icon: '/icons/whatsapp.svg' },
    },
  ] satisfies SocialLink[],
};
