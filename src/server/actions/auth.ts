'use server';

import { setTimeout as sleep } from 'node:timers/promises';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { checkCredentials, createSession, dashboardEnabled, deleteSession } from '@/server/auth';

export interface LoginState {
  error?: string;
}

const loginSchema = z.object({
  email: z.string().trim(),
  password: z.string(),
  from: z.string().optional(),
});

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!dashboardEnabled()) return { error: 'The dashboard is disabled on this server.' };

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !parsed.data.email || !parsed.data.password) {
    return { error: 'Enter your email and password.' };
  }

  if (!(await checkCredentials(parsed.data.email, parsed.data.password))) {
    // Slows down repeated guessing.
    await sleep(500);
    return { error: 'Incorrect email or password.' };
  }

  await createSession();
  const from = parsed.data.from;
  // Only return to dashboard paths, never to an arbitrary URL passed in the query string.
  redirect(from?.startsWith('/dashboard') ? from : '/dashboard');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
