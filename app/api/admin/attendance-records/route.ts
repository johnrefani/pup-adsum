import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { Models } from '@/lib/models';
import { formatDisplayTime } from '@/lib/dateTimeFormat';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const courseId = url.searchParams.get('courseId');
    const yearLevel = url.searchParams.get('yearLevel');
    const search = url.searchParams.get('search')?.trim();

    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = await User.findOne({ currentSessionToken: currentToken, role: 'admin' }).select('department');
    if (!admin?.department) return NextResponse.json({ students: [] });

    const memberFilter: any = { role: 'member', department: admin.department };
    if (courseId) memberFilter.course = courseId;
    if (yearLevel) memberFilter.yearLevel = yearLevel;

    const members = await User.find(memberFilter)
      .select('fullName idNumber')
      .lean();

    const memberIds = members.map((m: any) => m._id);

    const attendanceFilter: any = { member: { $in: memberIds } };
    if (sessionId) attendanceFilter.session = sessionId;

    const attendances = await Attendance.find(attendanceFilter)
      .select('member timeIn timeOut status')
      .lean();

    const summary = attendances.reduce(
      (acc: any, attendance: any) => {
        const status = attendance.status || 'none';
        acc.sessionTotalCount += 1;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {
        sessionTotalCount: 0,
        present: 0,
        absent: 0,
        late: 0,
        unfinished: 0,
        'timed-in': 0,
        'timed-in-late': 0,
        'late-unfinished': 0,
        none: 0,
      }
    );

    let result = members.map((member: any) => {
      const att = attendances.find((a: any) => a.member.toString() === member._id.toString());

      const timeIn = att?.timeIn ? formatDisplayTime(new Date(att.timeIn)) : '---';
      const timeOut = att?.timeOut ? formatDisplayTime(new Date(att.timeOut)) : '---';

      return {
        _id: member._id.toString(),
        name: member.fullName,
        idNumber: member.idNumber || 'N/A',
        timeIn,
        timeOut,
        status: att?.status || null,
      };
    });

    if (search) {
      result = result.filter((s: any) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.idNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ students: result, summary });
  } catch (error: any) {
    console.error('Attendance records error:', error);
    return NextResponse.json({ error: 'Failed to load records' }, { status: 500 });
  }
}
