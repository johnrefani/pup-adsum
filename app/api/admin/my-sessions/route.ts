import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

import { connectToDatabase } from '@/lib/mongodb';

// ✅ Explicit model imports (REQUIRED)
import Session from '@/models/Session';
import User from '@/models/User';
import Department from '@/models/Department';
import { Models } from '@/lib/models';

interface PopulatedSession {
  _id: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  department: {
    _id: mongoose.Types.ObjectId;
    acronym: string;
    name: string;
  };
  qrImageUrl?: string;
}

export async function GET() {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const username = cookieStore.get('authUser')?.value;

    if (!username) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await User.findOne({
      username,
      role: 'admin',
    })
      .select('department')
      .lean<{ department: mongoose.Types.ObjectId }>();

    if (!admin?.department) {
      return NextResponse.json({ sessions: [] });
    }

    const sessions = await Session.find({
      department: admin.department,
    })
      .populate<{
        department: {
          _id: mongoose.Types.ObjectId;
          acronym: string;
          name: string;
        };
      }>('department', 'acronym name')
      .sort({ date: -1, createdAt: -1 })
      .lean<PopulatedSession[]>();

    const formatted = sessions.map((s) => ({
      _id: s._id.toString(),
      title: s.title,
      date: s.date.toISOString().split('T')[0],
      startTime: s.startTime,
      endTime: s.endTime,
      description: s.description ?? '',
      department: s.department._id.toString(),
      departmentLabel: `${s.department.acronym} - ${s.department.name}`,
      qrImageUrl: s.qrImageUrl ?? '',
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error) {
    console.error('Failed to fetch admin sessions:', error);
    return NextResponse.json(
      { error: 'Failed to load sessions' },
      { status: 500 }
    );
  }
}
