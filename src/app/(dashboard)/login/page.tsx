import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { LoginForm } from '@/components/dashboard/login-form';
import { dashboardEnabled, readSession } from '@/server/auth';

export const metadata: Metadata = { title: 'Sign in' };

interface LoginPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (!dashboardEnabled()) notFound();
  if (await readSession()) redirect('/dashboard');
  const { from } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-6">
      <LoginForm from={from} />
    </div>
  );
}
