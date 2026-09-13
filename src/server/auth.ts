import 'server-only';

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

import { SESSION_COOKIE } from '@/lib/constants';
import { verifyPassword } from '@/server/password';

const SESSION_DAYS = 7;

/** The dashboard only exists where DASHBOARD_ENABLED=true (set in .env.local, never on Vercel). */
export function dashboardEnabled(): boolean {
  return process.env.DASHBOARD_ENABLED === 'true';
}

function sessionKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be set and at least 32 characters long');
  return new TextEncoder().encode(secret);
}

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !passwordHash) return false;

  // Always run the hash comparison so a wrong email takes as long as a wrong password.
  const passwordMatches = await verifyPassword(password, passwordHash);
  return passwordMatches && email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export async function createSession(): Promise<void> {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(sessionKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export const readSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ['HS256'] });
    return payload;
  } catch {
    return null;
  }
});

/** Guard for dashboard pages and server actions: 404 when disabled, login redirect when signed out. */
export async function requireDashboard() {
  if (!dashboardEnabled()) notFound();
  const session = await readSession();
  if (!session) redirect('/login');
  return session;
}

/** Guard for route handlers: returns an error response to send back, or null when allowed. */
export async function guardApiRequest(): Promise<Response | null> {
  if (!dashboardEnabled()) return new Response('Not found', { status: 404 });
  if (!(await readSession())) return new Response('Unauthorized', { status: 401 });
  return null;
}
