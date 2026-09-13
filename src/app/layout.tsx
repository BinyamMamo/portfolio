import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import { themeInitScript } from '@/lib/theme';
import { getProfile } from '@/server/content';

import './globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const title = `${profile.name} | ${profile.role}`;

  return {
    metadataBase: new URL(profile.siteUrl),
    title: { default: title, template: `%s | ${profile.name}` },
    description: profile.summary,
    authors: [{ name: profile.name, url: profile.siteUrl }],
    openGraph: {
      type: 'website',
      url: profile.siteUrl,
      siteName: profile.name,
      title,
      description: profile.summary,
      images: profile.avatar ? [profile.avatar] : undefined,
    },
    twitter: { card: 'summary' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      // The init script may change the class before hydration.
      suppressHydrationWarning
      // Tells Next.js the smooth scrolling in globals.css is intentional, so route changes jump instantly.
      data-scroll-behavior="smooth"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex flex-col font-sans">{children}</body>
    </html>
  );
}
