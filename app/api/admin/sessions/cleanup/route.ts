import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import cloudinary from '@/lib/cloudinary';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const admin = await User.findOne({ currentSessionToken: currentToken, role: 'admin' })
      .select('department')
      .lean<{ department: unknown }>();

    if (!admin?.department) {
      return NextResponse.json({ deletedCount: 0, deletedSessions: [] });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const expiredSessions = await Session.find({
      department: admin.department,
      date: { $lte: oneYearAgo },
    }).lean<{ _id: unknown; qrToken?: string }[]>();

    if (expiredSessions.length === 0) {
      return NextResponse.json({ deletedCount: 0, deletedSessions: [] });
    }

    const cleanupResults = await Promise.all(
      expiredSessions.map(async (session) => {
        try {
          if (session.qrToken) {
            await cloudinary.uploader.destroy(`pup-adsum/attendance-qr/${session.qrToken}`);
          }
        } catch (destroyError) {
          console.error('Cloudinary cleanup failed for session', session._id, destroyError);
        }

        await Attendance.deleteMany({ session: session._id });
        return session._id?.toString?.() ?? '';
      })
    );

    await Session.deleteMany({ _id: { $in: expiredSessions.map((s) => s._id) } });

    return NextResponse.json({
      deletedCount: cleanupResults.length,
      deletedSessions: cleanupResults,
    });
  } catch (error: any) {
    console.error('Failed to auto-cleanup old sessions:', error);
    return NextResponse.json({ error: error.message || 'Cleanup failed' }, { status: 500 });
  }
}
