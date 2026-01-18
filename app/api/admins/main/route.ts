// app/api/admins/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

type AdminLean = {
  _id: any;
  fullName: string;
  username: string;
};

async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return null;

  await connectToDatabase();

  return await User.findOne({ currentSessionToken: sessionToken, role: 'main' });
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: admin._id.toString(),
      fullName: admin.fullName,
      username: admin.username,
    });
  } catch (error) {
    console.error('GET /api/admins/me error:', error);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, username, password } = body;

    if (!fullName || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updates: any = {};
    let shouldRotateSession = false;

    // Check if username changed
    if (username.trim() !== admin.username) {
      const existing = await User.findOne({ username: username.trim(), _id: { $ne: admin._id } });
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
      updates.username = username.trim();
      shouldRotateSession = true;
    }

    // Check if fullName changed
    if (fullName.trim() !== admin.fullName) {
      updates.fullName = fullName.trim();
    }

    // Check if password changed
    if (password && password.trim() && password.trim() !== admin.password) {
      updates.password = password.trim();
      shouldRotateSession = true;
    }

    // Rotate session token if username or password changed
    if (shouldRotateSession) {
      const newSessionToken = crypto.randomBytes(32).toString('hex');
      updates.currentSessionToken = newSessionToken;

      const response = NextResponse.json({ success: true, message: 'Account updated successfully' });

      response.cookies.set('sessionToken', newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      await User.findByIdAndUpdate(admin._id, updates);
      return response;
    }

    // Just update other fields
    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(admin._id, updates);
      return NextResponse.json({ success: true, message: 'Account updated successfully' });
    }

    return NextResponse.json({ message: 'No changes made' });
  } catch (error: any) {
    console.error('PATCH /api/admins/me error:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
