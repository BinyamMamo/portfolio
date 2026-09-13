import { PageHeader } from '@/components/dashboard/page-header';
import { TimelineEditor } from '@/components/dashboard/timeline-editor';
import { saveEducation } from '@/server/actions/content';
import { requireDashboard } from '@/server/auth';
import { getEducation } from '@/server/content';

export default async function EducationPage() {
  await requireDashboard();
  const entries = await getEducation();

  return (
    <>
      <PageHeader title="Education" description="Degrees, certifications and courses, newest first." />
      <TimelineEditor entries={entries} onSave={saveEducation} noun="education entry" />
    </>
  );
}
