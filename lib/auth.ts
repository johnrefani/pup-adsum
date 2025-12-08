// lib/auth.ts
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const username = cookieStore.get('authUser')?.value;
  if (!username) return null;

  await connectToDatabase();
  return await User.findOne({ username, role: 'admin' }).lean();
}