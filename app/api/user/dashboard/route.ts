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
  date: string;
  startTime: string;
  endTime: string;
  status: 'present' | 'absent' | 'unfinished' | 'late' | 'timed-in' | 'timed-in-late' | 'late-unfinished' | null;
}

interface DashboardResponse {
  todaySession: TodaySession | null;
  upcomingEvents: UpcomingEvent[];
}

const getManilaDateKey = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const getManilaNow = () =>
  new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

const parseSessionDateTime = (session: { date: Date; startTime: string; endTime: string }, timeKey: 'startTime' | 'endTime') => {
  const sessionDate = session.date.toISOString().split('T')[0];
  const [hour, minute] = session[timeKey].split(':');
  return new Date(`${sessionDate}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`);
};

export async function GET(): Promise<NextResponse<DashboardResponse | { error: string }>> {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('sessionToken')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ currentSessionToken: sessionToken, role: 'member' });
    if (!user) {
      return NextResponse.json({ error: 'User not found or not a member' }, { status: 404 });
    }

    const now = getManilaNow();
    const todayKey = getManilaDateKey(new Date());
    const todayDate = new Date(`${todayKey}T00:00:00.000Z`);

    const candidateSessions = await Session.find({
      department: user.department,
      date: { $gte: todayDate },
    })
      .sort({ date: 1, startTime: 1 })
      .select('title date startTime endTime')
      .lean();

    const activeSessionDoc = candidateSessions.find((session: any) => {
      const start = parseSessionDateTime(session, 'startTime');
      const end = parseSessionDateTime(session, 'endTime');
      return now >= start && now <= end;
    });

    const nextUpcomingSessionDoc = candidateSessions.find((session: any) =>
      parseSessionDateTime(session, 'startTime') > now
    );

    const latestEndedTodaySessionDoc = [...candidateSessions]
      .filter((session: any) =>
        session.date.toISOString().split('T')[0] === todayKey &&
        parseSessionDateTime(session, 'endTime') < now
      )
      .sort((a: any, b: any) => parseSessionDateTime(b, 'endTime').getTime() - parseSessionDateTime(a, 'endTime').getTime())[0];

    const todaySessionDoc = activeSessionDoc || nextUpcomingSessionDoc || latestEndedTodaySessionDoc || null;

    let todaySession: TodaySession | null = null;

    if (todaySessionDoc) {
      const attendance = await Attendance.findOne({
        session: todaySessionDoc._id,
        member: user._id,
      });

      todaySession = {
        _id: String(todaySessionDoc._id),
        title: todaySessionDoc.title,
        date: todaySessionDoc.date.toISOString().split('T')[0],
        startTime: todaySessionDoc.startTime,
        endTime: todaySessionDoc.endTime,
        status: attendance?.status ?? null,
      };
    }

    const upcomingSessions = candidateSessions
      .filter((session: any) => parseSessionDateTime(session, 'startTime') > now)
      .sort((a: any, b: any) => parseSessionDateTime(a, 'startTime').getTime() - parseSessionDateTime(b, 'startTime').getTime())
      .slice(0, 3);

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
