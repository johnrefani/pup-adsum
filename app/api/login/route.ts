import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import crypto from 'crypto'; 
import { hashPassword, isHashedPassword, verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    const user = await collection.findOne({ username });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');

    const updates: Record<string, string> = { currentSessionToken: sessionToken };
    if (!isHashedPassword(user.password)) {
      updates.password = hashPassword(password);
    }

    await collection.updateOne({ username }, { $set: updates });

    const response = NextResponse.json({ 
      success: true, 
      username, 
      role: user.role 
    });

    response.cookies.set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
