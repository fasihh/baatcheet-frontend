import 'server-only';
import { cookies } from 'next/headers';
 
export async function createSession(token: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();
 
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  return (await cookies()).get('session')?.value;
}

export async function updateSession() {
  const session = await getSession();
 
  if (!session)
    return null;
 
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
 
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
