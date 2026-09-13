import { cookies } from 'next/headers';
import type { ReactNode } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireDashboard } from '@/server/auth';
import { getProfile } from '@/server/content';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboard();
  const [profile, cookieStore] = await Promise.all([getProfile(), cookies()]);
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar name={profile.name} email={profile.email} avatar={profile.avatar} />
      <SidebarInset>
        <DashboardHeader />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
