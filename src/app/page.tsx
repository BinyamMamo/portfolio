import { Contact } from '@/components/home/contact';
import { Hero } from '@/components/home/hero';
import { Skills } from '@/components/home/skills';
import { Timeline } from '@/components/home/timeline';
import { Work } from '@/components/home/work';
import { Section } from '@/components/section';
import { education, experience } from '@/content/career';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Work />
      <Skills />
      <Section id="experience" index="03" label="Experience" title="Where I have worked">
        <Timeline entries={experience} />
      </Section>
      <Section id="education" index="04" label="Education" title="What I have studied">
        <Timeline entries={education} />
      </Section>
      <Contact />
    </>
  );
}
