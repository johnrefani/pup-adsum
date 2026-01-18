import { Header, AdminManagement } from '@/lib/imports';
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

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    user = await collection.findOne({ currentSessionToken: sessionToken });

    if (!user) {
      redirect('/');
    }

    userRole = user.role || null;

  } catch (error) {
    console.error('Error validating session:', error);
    redirect('/');
  }

  if (userRole === 'member') {
    redirect('/dashboard');
  }
  
  if(userRole === 'admin'){
    redirect('/admin');
  }
  
  return (
    <main>
      <Header type='main' />
      <div className="min-h-screen mx-sm md:mx-md lg:mx-lg">
        <AdminManagement />
      </div>
    </main>
  );
}