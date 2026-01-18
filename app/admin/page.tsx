import { AdminDashboard, Header } from '@/lib/imports';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';

export default async function AdminPage() {
const cookieStore = await cookies(); 
  const sessionToken = cookieStore.get('sessionToken')?.value;

  if (!sessionToken) {
    redirect('/');
  }

  let user = null;
  let userRole: string | null = null;
  let userName: string | null = null;

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    user = await collection.findOne({ currentSessionToken: sessionToken });

    if (!user) {
      redirect('/');
    }

    userRole = user.role || null;
    userName = user.username || null;

  } catch (error) {
    console.error('Error validating session:', error);
    redirect('/');
  }

  if (userRole === 'member') {
    redirect('/dashboard');
  }

    if (userRole === 'main') {
    redirect('/manage-admin');
  }


  return (
    <main>
      <Header type='admin' />
      <div className="min-h-screen mx-sm md:mx-md lg:mx-lg">
        <AdminDashboard username={userName} />
      </div>
    </main>
  );
}