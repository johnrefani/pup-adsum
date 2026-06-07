// app/api/user/my-attendance/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { Models } from '@/lib/models';

type AttendanceStatus = 'present' | 'absent' | 'unfinished' | 'late' | 'timed-in' | 'timed-in-late' | 'late-unfinished' | null;

function isValidSchoolYear(schoolYear: string) {
  const match = schoolYear.match(/^(\d{4})-(\d{4})$/);
  return Boolean(match) && Number(match?.[2]) === Number(match?.[1]) + 1;
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

    if (!isValidSchoolYear(schoolYear)) {
      return NextResponse.json({ error: 'Invalid school year' }, { status: 400 });
    }

    const validMonth = new Date(`${month} 1, 2000`).toLocaleString('en-US', { month: 'long' });
    if (validMonth !== month) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }

    const attendances = await Attendance.find({ member: user._id })
      .populate({
        path: 'session',
        model: Session,
        select: 'title date startTime endTime department schoolYear semester',
      })
      .lean();

    const records = attendances
      .filter((att: any) => {
        const session = att.session;
        if (!session) return false;

        const sessionDepartment = session.department?.toString();
        if (sessionDepartment && sessionDepartment !== user.department?.toString()) return false;

        const sessionDate = new Date(session.date);
        if (sessionDate < cutoff) return false;

        const sessionMonth = sessionDate.toLocaleString('en-US', {
          month: 'long',
          timeZone: 'Asia/Manila',
        });
        if (sessionMonth !== month) return false;

        if (session.schoolYear && session.schoolYear !== schoolYear) return false;
        if (session.semester && session.semester !== semester) return false;

        return true;
      })
      .sort((a: any, b: any) => {
        const sessionA = a.session;
        const sessionB = b.session;
        const dateDiff = new Date(sessionA.date).getTime() - new Date(sessionB.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return String(sessionA.startTime || '').localeCompare(String(sessionB.startTime || ''));
      })
      .map((att: any) => {
      const session = att.session;
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
      const dateStr = new Date(session.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Asia/Manila',
      });

      return {
        _id: att._id.toString(),
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
