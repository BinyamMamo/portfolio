import { ArrowRight, Download } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { ButtonLink } from '@/components/button-link';
import { SocialLinks } from '@/components/social-links';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

const facts = [
  { value: '3.99', label: 'GPA in Computer Engineering' },
  { value: 'Top 5', label: 'ALX capstone project' },
  { value: String(projects.length), label: 'Projects built' },
];

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="link-underline">
      {children}
    </a>
  );
}

export function Hero() {
  return (
    <section className="page-container pt-12 pb-20 sm:pt-20 sm:pb-24">
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-20">
        <div>
          <p className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {site.role}
            <span aria-hidden className="text-border-strong">
              /
            </span>
            {site.location}
          </p>
          <h1 className="heading mt-6 text-5xl sm:text-7xl">{site.name}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
            I build backend systems, APIs and the web apps on top of them, and I care about putting AI to practical use.
            Certified by <InlineLink href="https://www.alxafrica.com">ALX</InlineLink> and studying Computer
            Engineering at the <InlineLink href="https://ud.ac.ae">University of Dubai</InlineLink>.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/#work">
              View projects
              <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href={site.resume} variant="secondary" external>
              <Download aria-hidden />
              Resume
            </ButtonLink>
          </div>
          <SocialLinks className="mt-10" />
        </div>

        <div className="order-first w-32 sm:w-40 md:order-none md:w-full">
          <div className="card relative aspect-[4/5] overflow-hidden rounded-panel">
            <Image
              src="/media/portrait.webp"
              alt={`Portrait of ${site.name}`}
              fill
              preload
              sizes="(min-width: 1024px) 304px, (min-width: 768px) 256px, 160px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <dl className="mt-16 grid divide-y border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col-reverse py-5 sm:px-6 sm:first:pl-0">
            <dt className="mt-1 text-sm text-fg-muted">{fact.label}</dt>
            <dd className="heading text-2xl">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
