import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { Login } from '@/lib/imports';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const authUser = cookieStore.get('sessionToken')?.value;

  if (authUser) {
    let userRole: string | null = null;

    try {
      const { db } = await connectToDatabase();
      const user = await db
        .collection('users')
        .findOne({ currentSessionToken: authUser }, { projection: { role: 1 } });

      userRole = user?.role || null;
    } catch (error) {
      console.error('Error checking user role on root page:', error);
    }

    if (userRole === 'admin') {
      redirect('/admin');
    } else if (userRole === 'member') {
      redirect('/dashboard');
    }
  }

  const url = new URL(
    typeof window === 'undefined'
      ? 'http://localhost:3000'
      : window.location.href
  );
  const redirectTo = url.searchParams.get('redirectTo');

  return (
    <main className="min-h-screen flex-center bg-gradient-to-br from-maroon-50 to-red-100">
      <Login initialRedirectTo={redirectTo || undefined} />
    </main>
  );
}