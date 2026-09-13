import { Mail } from 'lucide-react';

import { ButtonLink } from '@/components/button-link';
import { CopyEmailButton } from '@/components/copy-email-button';
import { SectionLabel } from '@/components/section';
import { SocialLinks } from '@/components/social-links';
import { site } from '@/content/site';

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t">
      <div className="page-container py-20 sm:py-28">
        <div className="card rounded-panel p-8 sm:p-12">
          <SectionLabel index="05" label="Contact" />
          <h2 id="contact-title" className="heading mt-4 max-w-2xl text-3xl sm:text-5xl">
            Get in touch
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-fg-muted">
            Whether it is a role, a project or a question about something I built, email is the quickest way to reach
            me.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`mailto:${site.email}`} external>
              <Mail aria-hidden />
              {site.email}
            </ButtonLink>
            <CopyEmailButton email={site.email} />
          </div>
          <SocialLinks className="mt-10 border-t pt-8" />
        </div>
      </div>
    </section>
  );
}
