import { PageHeader } from '@/components/dashboard/page-header';
import { ProfileEditor } from '@/components/dashboard/profile-editor';
import { requireDashboard } from '@/server/auth';
import { getProfile } from '@/server/content';

export default async function ProfilePage() {
  await requireDashboard();
  const profile = await getProfile();

  return (
    <>
      <PageHeader title="Profile" description="Who you are and how people reach you." />
      <ProfileEditor profile={profile} />
    </>
  );
}
