import { Areas } from '@/components/home/areas';
import { ClientWork } from '@/components/home/client-work';
import { Contact } from '@/components/home/contact';
import { Hero } from '@/components/home/hero';
import { Skills } from '@/components/home/skills';
import { Timeline } from '@/components/home/timeline';
import { Work } from '@/components/home/work';
import { Section } from '@/components/section';
import { getEducation, getExperience } from '@/server/content';

export default async function HomePage() {
  const [experience, education] = await Promise.all([getExperience(), getEducation()]);

  return (
    <>
      <Hero />
      <Work />
      <ClientWork index="02" />
      <Areas index="03" />
      <Skills />
      {experience.length > 0 && (
        <Section id="experience" index="05" label="Experience" title="Where I have worked">
          <Timeline entries={experience} />
        </Section>
      )}
      {education.length > 0 && (
        <Section id="education" index="06" label="Education" title="What I have studied">
          <Timeline entries={education} />
        </Section>
      )}
      <Contact />
    </>
  );
}
