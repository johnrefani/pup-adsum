import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const courseId = url.searchParams.get('courseId');
    const yearLevel = url.searchParams.get('yearLevel');
    const search = url.searchParams.get('search')?.trim();

    const cookieStore = await cookies();
    const username = cookieStore.get('authUser')?.value;
    if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = await User.findOne({ username, role: 'admin' }).select('department');
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
      .select('member timeIn status')
      .lean();

    let result = members.map((member: any) => {
      const att = attendances.find((a: any) => a.member.toString() === member._id.toString());

      const timeIn = att?.timeIn
        ? new Date(att.timeIn).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : '---';

      return {
        _id: member._id.toString(),
        name: member.fullName,
        idNumber: member.idNumber || 'N/A',
        timeIn,
        status: att?.status || null,
      };
    });

    if (search) {
      result = result.filter((s: any) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.idNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ students: result });
  } catch (error: any) {
    console.error('Attendance records error:', error);
    return NextResponse.json({ error: 'Failed to load records' }, { status: 500 });
  }
}