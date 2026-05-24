import { Header, AdminManagement } from '@/lib/imports';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';

export default async function MasterAdminAccountsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;

  if (!sessionToken) redirect('/');

  try {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ currentSessionToken: sessionToken });

    if (!user) redirect('/');
    if (user.role === 'member') redirect('/dashboard');
    if (user.role === 'admin') redirect('/admin');
  } catch (error) {
    console.error('Error validating session:', error);
    redirect('/');
  }

  return (
    <main>
      <Header type="main" />
      <div className="min-h-screen mx-sm md:mx-md lg:mx-lg">
        <AdminManagement />
      </div>
    </main>
  );
}
