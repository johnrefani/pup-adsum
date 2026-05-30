// app/api/user/my-attendance/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { Models } from '@/lib/models';

type AttendanceStatus = 'present' | 'absent' | 'unfinished' | 'late' | 'timed-in' | 'timed-in-late' | 'late-unfinished' | null;

function schoolYearRange(schoolYear: string) {
  const match = schoolYear.match(/^(\d{4})-(\d{4})$/);
  if (!match) return null;

  return {
    start: new Date(Number(match[1]), 0, 1),
    end: new Date(Number(match[2]), 11, 31, 23, 59, 59),
  };
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); 
    const schoolYear = searchParams.get('schoolYear') || searchParams.get('year');
    const semester = searchParams.get('semester');

    if (!month || !schoolYear || !semester) {
      return NextResponse.json({ error: 'Month, school year, and semester are required' }, { status: 400 });
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

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);

    const oldSessions = await Session.find({ date: { $lt: cutoff } }).select('_id');
    const oldSessionIds = oldSessions.map((session) => session._id);
    if (oldSessionIds.length > 0) {
      await Attendance.deleteMany({
        member: user._id,
        session: { $in: oldSessionIds },
      });
    }

    const yearRange = schoolYearRange(schoolYear);
    if (!yearRange) {
      return NextResponse.json({ error: 'Invalid school year' }, { status: 400 });
    }

    const monthIndex = new Date(`${month} 1, ${yearRange.start.getFullYear()}`).getMonth();
    const possibleYears = [yearRange.start.getFullYear(), yearRange.end.getFullYear()];
    const monthWindows = possibleYears
      .map((possibleYear) => {
        const start = new Date(possibleYear, monthIndex, 1);
        const end = new Date(possibleYear, monthIndex + 1, 0, 23, 59, 59);
        return {
          start: start < cutoff ? cutoff : start,
          end,
        };
      })
      .filter((window) =>
        window.end >= cutoff &&
        window.start >= yearRange.start &&
        window.start <= yearRange.end
      );

    if (monthWindows.length === 0) {
      return NextResponse.json({
        records: [],
        stats: { present: 0, absent: 0, late: 0, unfinished: 0 },
      });
    }

    const sessions = await Session.find({
      department: user.department,
      $and: [
        {
          $or: monthWindows.map((window) => ({
            date: { $gte: window.start, $lte: window.end },
          })),
        },
        {
          $or: [
            { schoolYear },
            { schoolYear: { $exists: false } },
            { schoolYear: '' },
          ],
        },
        {
          $or: [
            { semester },
            { semester: { $exists: false } },
          ],
        },
      ],
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
            hour12: true,
            timeZone: 'Asia/Manila',
          })
        : null;
      const timeOut = att?.timeOut
        ? new Date(att.timeOut).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila',
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
        timeOut: timeOut || "Not Timed Out",
        status: (att?.status ?? null) as AttendanceStatus,
      };
    });

    const stats = records.reduce(
      (acc, record) => {
        if (record.status === 'present') acc.present += 1;
        if (record.status === 'absent') acc.absent += 1;
        if (record.status === 'late' || record.status === 'timed-in-late' || record.status === 'late-unfinished') acc.late += 1;
        if (record.status === 'unfinished' || record.status === 'late-unfinished') acc.unfinished += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, unfinished: 0 }
    );

    return NextResponse.json({ records, stats });
  } catch (error: any) {
    console.error('My attendance fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
