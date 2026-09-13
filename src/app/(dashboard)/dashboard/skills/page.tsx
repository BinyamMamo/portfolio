import { PageHeader } from '@/components/dashboard/page-header';
import { SkillsEditor } from '@/components/dashboard/skills-editor';
import { requireDashboard } from '@/server/auth';
import { getSkillGroups } from '@/server/content';

export default async function SkillsPage() {
  await requireDashboard();
  const groups = await getSkillGroups();

  return (
    <>
      <PageHeader
        title="Skills"
        description="Grouped skills for the home page, the Skills menu and your CV."
      />
      <SkillsEditor groups={groups} />
    </>
  );
}
