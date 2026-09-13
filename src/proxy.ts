import { type NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE } from '@/lib/constants';

/**
 * Optimistic check only: sends visitors without a session cookie to the login page. The real checks
 * (flag, valid signature, expiry) run in src/server/auth.ts on every dashboard page, action and route.
 * When the dashboard is disabled, requests pass through and those checks answer with a 404.
 */
export function proxy(request: NextRequest) {
  if (process.env.DASHBOARD_ENABLED !== 'true') return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith('/dashboard') && !request.cookies.has(SESSION_COOKIE)) {
    const login = new URL('/login', request.url);
    login.searchParams.set('from', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
