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
      <Skills />
      {experience.length > 0 && (
        <Section id="experience" index="03" label="Experience" title="Where I have worked">
          <Timeline entries={experience} />
        </Section>
      )}
      {education.length > 0 && (
        <Section id="education" index="04" label="Education" title="What I have studied">
          <Timeline entries={education} />
        </Section>
      )}
      <Contact />
    </>
  );
}
