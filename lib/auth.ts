// lib/auth.ts
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

interface AdminLean {
  _id: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
}

export async function getCurrentAdmin(): Promise<AdminLean | null> {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get('sessionToken')?.value;
  if (!currentToken) return null;

  await connectToDatabase();

  const admin = await User.findOne({ currentSessionToken: currentToken, role: 'admin' })
    .select('department')
    .lean<{ department: mongoose.Types.ObjectId }>();

  return admin ? (admin as AdminLean) : null;
}