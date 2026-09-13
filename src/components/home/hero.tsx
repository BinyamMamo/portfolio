import { ArrowRight, Download } from 'lucide-react';
import Image from 'next/image';

import { ButtonLink } from '@/components/button-link';
import { SocialLinks } from '@/components/social-links';
import { cn } from '@/lib/cn';
import { RESUME_HREF } from '@/lib/constants';
import { renderInlineLinks } from '@/lib/inline-links';
import { getProfile } from '@/server/content';

const factColumns = ['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4'];

export async function Hero() {
  const profile = await getProfile();

  return (
    // data-ambient-end: the background gradient and aurora fade out around the bottom of this section.
    <section data-ambient-end className="page-container pt-12 pb-20 sm:pt-20 sm:pb-24">
      <div
        className={cn(
          'grid items-center gap-10',
          profile.avatar && 'md:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-20',
        )}
      >
        <div>
          <p className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1">
            {profile.role}
            {profile.location && (
              <>
                <span aria-hidden className="text-border-strong">
                  /
                </span>
                {profile.location}
              </>
            )}
          </p>
          <h1 className="heading mt-6 text-5xl sm:text-7xl">{profile.name}</h1>
          {profile.intro && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
              {renderInlineLinks(profile.intro, 'link-underline')}
            </p>
          )}
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/#work">
              View projects
              <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href={RESUME_HREF} variant="secondary" external>
              <Download aria-hidden />
              Resume
            </ButtonLink>
          </div>
          <SocialLinks className="mt-10" />
        </div>

        {profile.avatar && (
          <div className="order-first w-32 sm:w-40 md:order-none md:w-full">
            <div className="card relative aspect-[4/5] overflow-hidden rounded-panel">
              <Image
                src={profile.avatar}
                alt={`Portrait of ${profile.name}`}
                fill
                preload
                sizes="(min-width: 1024px) 304px, (min-width: 768px) 256px, 160px"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {profile.facts.length > 0 && (
        <dl
          className={cn(
            'mt-16 grid divide-y border-y sm:divide-x sm:divide-y-0',
            factColumns[profile.facts.length],
          )}
        >
          {profile.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse py-5 sm:px-6 sm:first:pl-0">
              <dt className="mt-1 text-sm text-fg-muted">{fact.label}</dt>
              <dd className="heading text-2xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
