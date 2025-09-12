import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from './lib/session';
 
const protectedRoutes = ['/', '/chats'];
const publicRoutes = ['/login'];
 
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
 
  const session = await getSession();
 
  if (isProtectedRoute && !session)
    return NextResponse.redirect(new URL('/login', req.nextUrl));
 
  if (
    isPublicRoute &&
    !!session &&
    req.nextUrl.pathname.startsWith('/login')
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
 
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
