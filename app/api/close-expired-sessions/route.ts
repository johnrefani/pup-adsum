// app/api/cron/mark-absent/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const today = new Date(now.toISOString().split('T')[0]); // Normalize to midnight

    // Find all sessions that have ended (date + endTime < now)
    const endedSessions = await Session.find({
      $or: [
        { date: { $lt: today } }, // Past dates
        {
          date: today,
          endTime: { $lt: now.toTimeString().slice(0, 5) }, // Today, but endTime passed
        },
      ],
    }).select('_id date endTime title');

    if (endedSessions.length === 0) {
      return NextResponse.json({
        message: 'No ended sessions found.',
        updated: 0,
      });
    }

    const sessionIds = endedSessions.map(s => s._id);

    // Update all attendance records where status is null → 'absent'
    const result = await Attendance.updateMany(
      {
        session: { $in: sessionIds },
        status: null,
      },
      {
        $set: { status: 'absent' },
      }
    );

    const details = endedSessions.map(s => ({
      sessionId: s._id.toString(),
      title: s.title,
      date: s.date.toISOString().split('T')[0],
      endTime: s.endTime,
    }));

    return NextResponse.json({
      message: 'Absent marking completed.',
      endedSessionsCount: endedSessions.length,
      updatedRecords: result.modifiedCount,
      sessions: details,
    });

  } catch (error: any) {
    console.error('Mark absent cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process', details: error.message },
      { status: 500 }
    );
  }
}

// Optional: Allow only GET
export const dynamic = 'force-dynamic';