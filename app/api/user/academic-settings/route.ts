import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import SystemSettings from '@/models/SystemSettings';
import User from '@/models/User';

const SETTINGS_KEY = 'academic';

function defaultSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-${year + 1}`;
}

export async function GET() {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('sessionToken')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ currentSessionToken: sessionToken, role: 'member' }).select('_id');
    if (!user) {
      return NextResponse.json({ error: 'User not found or not a member' }, { status: 404 });
    }

    const settings = await SystemSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $setOnInsert: {
          key: SETTINGS_KEY,
          schoolYear: defaultSchoolYear(),
          semester: '1st Semester',
        },
      },
      { upsert: true, new: true }
    ).select('schoolYear semester');

    const latestAttendances = await Attendance.find({ member: user._id })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(50)
      .populate({
        path: 'session',
        model: Session,
        select: 'date schoolYear semester',
      })
      .lean();

    const latestAttendanceWithSession = latestAttendances
      .map((attendance: any) => attendance.session)
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return NextResponse.json({
      schoolYear: latestAttendanceWithSession?.schoolYear || settings.schoolYear,
      semester: latestAttendanceWithSession?.semester || settings.semester,
      month: latestAttendanceWithSession?.date
        ? new Date(latestAttendanceWithSession.date).toLocaleString('en-US', {
            month: 'long',
            timeZone: 'Asia/Manila',
          })
        : undefined,
    });
  } catch (error) {
    console.error('GET /api/user/academic-settings error:', error);
    return NextResponse.json({ error: 'Failed to load academic settings' }, { status: 500 });
  }
}
