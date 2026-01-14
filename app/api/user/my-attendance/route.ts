// app/api/user/my-attendance/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { Models } from '@/lib/models';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); 
    const year = searchParams.get('year'); 

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('sessionToken')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ currentSessionToken: sessionToken, role: 'member' });
    if (!user) {
      return NextResponse.json({ error: 'User not found or not a member' }, { status: 404 });
    }

    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const startOfMonth = new Date(Number(year), monthIndex, 1);
    const endOfMonth = new Date(Number(year), monthIndex + 1, 0, 23, 59, 59);

    const sessions = await Session.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
      department: user.department,
    }).sort({ date: 1, startTime: 1 });

    const sessionIds = sessions.map(s => s._id);

    const attendances = await Attendance.find({
      member: user._id,
      session: { $in: sessionIds }
    }).lean();

    const attendanceMap = new Map();
    attendances.forEach(att => {
      attendanceMap.set(att.session.toString(), att);
    });

    const records = sessions.map(session => {
      const att = attendanceMap.get(session._id.toString());
      const timeIn = att?.timeIn
        ? new Date(att.timeIn).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        : null;

      const sessionName = `${session.title} (${session.startTime} - ${session.endTime})`;
      const dateStr = session.date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      return {
        _id: session._id.toString(),
        session: sessionName,
        date: dateStr,
        timeIn: timeIn || "Not Attended",
        isPresent: att?.status === 'present'
      };
    });

    return NextResponse.json({ records });
  } catch (error: any) {
    console.error('My attendance fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}