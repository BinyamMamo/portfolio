import { AreasEditor } from '@/components/dashboard/areas-editor';
import { PageHeader } from '@/components/dashboard/page-header';
import { requireDashboard } from '@/server/auth';
import { getAreas, getProjects } from '@/server/content';

export default async function AreasPage() {
  await requireDashboard();
  const [areas, projects] = await Promise.all([getAreas(), getProjects()]);
  const counts = Object.fromEntries(
    areas.map((area) => [area.id, projects.filter((project) => project.areas?.includes(area.id)).length]),
  );

  return (
    <>
      <PageHeader
        title="Areas"
        description="The themes your projects cluster into. They drive the Focus section on the home page and the project filters."
      />
      <AreasEditor areas={areas} counts={counts} />
    </>
  );
}
