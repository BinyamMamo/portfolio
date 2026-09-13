import Link from 'next/link';

import { dashboardNav } from '@/components/dashboard/nav-items';
import { PageHeader } from '@/components/dashboard/page-header';
import { PublishCard } from '@/components/dashboard/publish-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireDashboard } from '@/server/auth';
import {
  getCvVariants,
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkillGroups,
} from '@/server/content';
import { contentChanges, currentBranch } from '@/server/publish';

export default async function DashboardPage() {
  await requireDashboard();
  const [profile, projects, experience, education, skills, variants, changes, branch] = await Promise.all([
    getProfile(),
    getProjects(),
    getExperience(),
    getEducation(),
    getSkillGroups(),
    getCvVariants(),
    contentChanges().catch(() => []),
    currentBranch().catch(() => 'unknown'),
  ]);

  const summaries: Record<string, string> = {
    '/dashboard/profile': `${profile.links.length} links, ${profile.facts.length} highlights`,
    '/dashboard/projects': `${projects.length} projects, ${projects.filter((project) => project.featured).length} featured`,
    '/dashboard/experience': `${experience.length} entries`,
    '/dashboard/education': `${education.length} entries`,
    '/dashboard/skills': `${skills.reduce((total, group) => total + group.items.length, 0)} skills in ${skills.length} groups`,
    '/dashboard/cv': `${variants.length} tailored ${variants.length === 1 ? 'version' : 'versions'}`,
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile.name.split(' ')[0]}`}
        description="Everything here feeds both the public site and your CV."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardNav
          .filter((item) => item.href !== '/dashboard')
          .map((item) => (
            <Link key={item.href} href={item.href} className="group rounded-xl focus-visible:outline-none">
              <Card className="h-full transition-colors group-hover:bg-muted/50">
                <CardHeader>
                  <item.icon className="mb-2 size-5 text-muted-foreground" />
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{summaries[item.href]}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
      </div>
      <div className="mt-6">
        <PublishCard changes={changes} branch={branch} />
      </div>
    </>
  );
}
