// app/api/member/dashboard/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import User from '@/models/User';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { Models } from '@/lib/models';

interface UpcomingEvent {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface TodaySession {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'present' | 'absent' | null;
}

interface DashboardResponse {
  todaySession: TodaySession | null;
  upcomingEvents: UpcomingEvent[];
}

export async function GET(): Promise<NextResponse<DashboardResponse | { error: string }>> {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const username = cookieStore.get('authUser')?.value;

    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ username, role: 'member' });
    if (!user) {
      return NextResponse.json({ error: 'User not found or not a member' }, { status: 404 });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todaySessionDoc = await Session.findOne({
      department: user.department,
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ date: 1 });

    let todaySession: TodaySession | null = null;

    if (todaySessionDoc) {
      const attendance = await Attendance.findOne({
        session: todaySessionDoc._id,
        member: user._id,
      });

      todaySession = {
        _id: todaySessionDoc._id.toString(),
        title: todaySessionDoc.title,
        startTime: todaySessionDoc.startTime,
        endTime: todaySessionDoc.endTime,
        status: attendance?.status ?? null,
      };
    }

    const upcomingSessions = await Session.find({
      department: user.department,
      date: { $gt: todayEnd },
    })
      .sort({ date: 1, startTime: 1 })
      .limit(3)
      .select('title date startTime endTime')
      .lean();

    const upcomingEvents: UpcomingEvent[] = upcomingSessions.map((s: any) => ({
      _id: (s._id as mongoose.Types.ObjectId).toString(),
      title: s.title as string,
      date: new Date(s.date).toISOString().split('T')[0],
      startTime: s.startTime as string,
      endTime: s.endTime as string,
    }));

    return NextResponse.json({
      todaySession,
      upcomingEvents,
    });
  } catch (error: any) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}