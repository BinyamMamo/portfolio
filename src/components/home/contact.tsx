import { Mail } from 'lucide-react';

import { ButtonLink } from '@/components/button-link';
import { CopyEmailButton } from '@/components/copy-email-button';
import { SectionLabel } from '@/components/section';
import { SocialLinks } from '@/components/social-links';
import { getProfile } from '@/server/content';

export async function Contact() {
  const { email } = await getProfile();

  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t">
      <div className="page-container py-20 sm:py-28">
        <div className="rounded-panel border p-8 sm:p-12">
          <SectionLabel index="07" label="Contact" />
          <h2 id="contact-title" className="heading mt-4 max-w-2xl text-3xl sm:text-5xl">
            Get in touch
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-fg-muted">
            Whether it is a role, a project or a question about something I built, email is the quickest way to reach
            me.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`mailto:${email}`} external>
              <Mail aria-hidden />
              {email}
            </ButtonLink>
            <CopyEmailButton email={email} />
          </div>
          <SocialLinks className="mt-10 border-t pt-8" />
        </div>
      </div>
    </section>
  );
}
