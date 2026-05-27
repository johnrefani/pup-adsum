// app/api/cron/mark-absent/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import { Models } from '@/lib/models';

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
    }).select('_id date endTime title timeOutLimitMinutes');

    if (endedSessions.length === 0) {
      return NextResponse.json({
        message: 'No ended sessions found.',
        updated: 0,
      });
    }

    const sessionIds = endedSessions.map(s => s._id);

    // Update all attendance records where status is null → 'absent'
    const absentResult = await Attendance.updateMany(
      {
        session: { $in: sessionIds },
        status: null,
      },
      {
        $set: { status: 'absent' },
      }
    );

    let unfinishedCount = 0;
    for (const session of endedSessions) {
      const deadline = new Date(`${session.date.toISOString().split('T')[0]}T${session.endTime}:00`);
      deadline.setMinutes(deadline.getMinutes() + (session.timeOutLimitMinutes ?? 30));

      if (now <= deadline) continue;

      const unfinishedResult = await Attendance.updateMany(
        {
          session: session._id,
          timeIn: { $ne: null },
          timeOut: null,
          status: 'timed-in',
        },
        {
          $set: { status: 'unfinished' },
        }
      );

      const lateUnfinishedResult = await Attendance.updateMany(
        {
          session: session._id,
          timeIn: { $ne: null },
          timeOut: null,
          status: 'timed-in-late',
        },
        {
          $set: { status: 'late-unfinished' },
        }
      );

      unfinishedCount += unfinishedResult.modifiedCount + lateUnfinishedResult.modifiedCount;
    }

    const details = endedSessions.map(s => ({
      sessionId: s._id.toString(),
      title: s.title,
      date: s.date.toISOString().split('T')[0],
      endTime: s.endTime,
    }));

    return NextResponse.json({
      message: 'Absent marking completed.',
      endedSessionsCount: endedSessions.length,
      updatedRecords: absentResult.modifiedCount + unfinishedCount,
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
