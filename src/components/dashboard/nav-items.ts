import {
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Layers,
  UserRound,
} from 'lucide-react';

export const dashboardNav = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Profile', href: '/dashboard/profile', icon: UserRound },
  { title: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { title: 'Experience', href: '/dashboard/experience', icon: BriefcaseBusiness },
  { title: 'Education', href: '/dashboard/education', icon: GraduationCap },
  { title: 'Skills', href: '/dashboard/skills', icon: Layers },
  { title: 'CV', href: '/dashboard/cv', icon: FileText },
] as const;

/** The nav item a path belongs to; nested pages (a single project) match their section. */
export function activeNavItem(pathname: string) {
  return (
    [...dashboardNav]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? dashboardNav[0]
  );
}
