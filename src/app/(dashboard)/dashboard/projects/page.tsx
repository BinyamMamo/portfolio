import { Plus } from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/components/dashboard/page-header';
import { ProjectsMenuEditor } from '@/components/dashboard/projects-menu-editor';
import { ProjectsTable } from '@/components/dashboard/projects-table';
import { Button } from '@/components/ui/button';
import { requireDashboard } from '@/server/auth';
import { getNavigationContent, getProjects } from '@/server/content';

export default async function ProjectsPage() {
  await requireDashboard();
  const [projects, navigation] = await Promise.all([getProjects(), getNavigationContent()]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Order sets how projects appear on the site. Featured projects are shown large on the home page."
        actions={
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        }
      />
      <ProjectsTable projects={projects} />
      <div className="mt-10">
        <ProjectsMenuEditor
          navigation={navigation}
          projects={projects.map((project) => ({ slug: project.slug, name: project.name }))}
        />
      </div>
    </>
  );
}
