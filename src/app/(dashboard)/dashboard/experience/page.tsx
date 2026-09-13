import { PageHeader } from '@/components/dashboard/page-header';
import { TimelineEditor } from '@/components/dashboard/timeline-editor';
import { saveExperience } from '@/server/actions/content';
import { requireDashboard } from '@/server/auth';
import { getExperience } from '@/server/content';

export default async function ExperiencePage() {
  await requireDashboard();
  const entries = await getExperience();

  return (
    <>
      <PageHeader title="Experience" description="Jobs, internships and programs, newest first." />
      <TimelineEditor entries={entries} onSave={saveExperience} noun="experience" />
    </>
  );
}
