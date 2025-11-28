import { Header } from '@/lib/imports';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const usernameCookie = cookieStore.get('authUser')?.value;

  if (!usernameCookie) {
    redirect('/');
  }

  let userRole: string | null = null;
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    const user = await collection.findOne({ username: usernameCookie });
    userRole = user?.role || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    redirect('/');
  }

  if (userRole !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <>
      <Header isAdmin={true} />
      <div className="h-screen flex items-center justify-center text-3xl">
        This is attendance records
      </div>
    </>
  );
}