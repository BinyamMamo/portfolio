import { ExternalLink } from 'lucide-react';

import { CvWorkspace } from '@/components/dashboard/cv-workspace';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { getTech } from '@/lib/tech';
import { requireDashboard } from '@/server/auth';
import { getCvSettings, getCvVariants, getExperience, getProjects, getSkillGroups } from '@/server/content';

export default async function CvPage() {
  await requireDashboard();
  const [settings, variants, projects, experience, skills] = await Promise.all([
    getCvSettings(),
    getCvVariants(),
    getProjects(),
    getExperience(),
    getSkillGroups(),
  ]);

  return (
    <>
      <PageHeader
        title="CV"
        description="Preview, download and tailor your CV. It is built from your profile, projects, experience, education and skills."
        actions={
          <Button variant="outline" asChild>
            <a href="/resume.pdf" target="_blank" rel="noreferrer">
              <ExternalLink />
              Public resume.pdf
            </a>
          </Button>
        }
      />
      <CvWorkspace
        settings={settings}
        variants={variants}
        projects={projects.map((project) => ({ value: project.slug, label: project.name }))}
        experience={experience.map((entry) => ({ value: entry.id, label: `${entry.title}, ${entry.org}` }))}
        skills={[...new Set(skills.flatMap((group) => group.items.map((id) => getTech(id).name)))]}
      />
    </>
  );
}
