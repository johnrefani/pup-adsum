import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getSessionWindow } from '@/lib/sessionTime';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ token?: string }> }) {
  try {
    const { token } = await params;
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ currentSessionToken: currentToken })
      .populate('department', 'acronym name')
      .select('fullName department role');

    if (!user || user.role !== 'member') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 });
    }

    const sessionDoc = await Session.findOne({ qrToken: token })
      .populate('department', 'acronym name')
      .lean()
      .exec() as {
        _id: string;
        title: string;
        date: Date;
        startTime: string;
        endTime: string;
        gracePeriodMinutes?: number;
        absentAfterMinutes?: number;
        startTimeOutBeforeEndMinutes?: number;
        timeOutLimitMinutes?: number;
        venueLocation?: { lat: number; lng: number };
        allowedRadiusMeters?: number;
        department: { _id: string; acronym?: string; name?: string };
      } | null;

    if (!sessionDoc) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const userDeptId = user.department?._id?.toString();
    const sessionDeptId = sessionDoc.department?._id?.toString();
    if (!userDeptId || userDeptId !== sessionDeptId) {
      return NextResponse.json({ error: 'You are not authorized for this session.' }, { status: 403 });
    }

    const now = new Date();
    const {
      end: sessionEndTime,
      lateCutoff,
      absentCutoff,
      timeOutStart,
      timeOutDeadline,
    } = getSessionWindow(sessionDoc);

    const distance = sessionDoc.venueLocation?.lat != null && sessionDoc.venueLocation?.lng != null
      ? getDistance(lat, lng, sessionDoc.venueLocation.lat, sessionDoc.venueLocation.lng)
      : null;

    if (sessionDoc.venueLocation?.lat != null && sessionDoc.allowedRadiusMeters && distance !== null) {
      if (distance > sessionDoc.allowedRadiusMeters) {
        return NextResponse.json({ error: `You are outside the allowed area (${Math.round(distance)}m away).` }, { status: 400 });
      }
    }

    const existingRecord = await Attendance.findOne({ session: sessionDoc._id, member: user._id });
    const isTimeOutAttempt = Boolean(existingRecord?.timeIn && !existingRecord?.timeOut);

    if (existingRecord?.status === 'absent') {
      return NextResponse.json({
        success: true,
        action: 'time-in',
        status: 'absent',
        timeIn: existingRecord.timeIn?.toISOString() ?? now.toISOString(),
      });
    }

    if (!existingRecord?.timeIn) {
      if (now > sessionEndTime) {
        await Attendance.findOneAndUpdate(
          { session: sessionDoc._id, member: user._id },
          { $set: { status: 'absent' } },
          { upsert: true }
        );
        return NextResponse.json({ success: true, action: 'time-in', status: 'absent', timeIn: now.toISOString() });
      }

      const status = now > absentCutoff
        ? 'absent'
        : now > lateCutoff
          ? 'timed-in-late'
          : 'timed-in';

      await Attendance.findOneAndUpdate(
        { session: sessionDoc._id, member: user._id },
        {
          $set: {
            timeIn: now,
            timeInLocation: { lat, lng },
            status,
            timeOut: null,
          },
        },
        { upsert: true }
      );

      return NextResponse.json({ success: true, action: 'time-in', status, timeIn: now.toISOString() });
    }

    if (isTimeOutAttempt) {
      if (now < timeOutStart) {
        return NextResponse.json({ error: 'Time-out is not open yet.' }, { status: 400 });
      }

      if (now > timeOutDeadline) {
        const finalStatus = existingRecord.status === 'timed-in-late' ? 'late-unfinished' : 'unfinished';
        await Attendance.findByIdAndUpdate(existingRecord._id, { status: finalStatus });
        return NextResponse.json({ success: true, action: 'time-out', status: finalStatus, timeIn: existingRecord.timeIn?.toISOString() });
      }

      const finalStatus = existingRecord.status === 'timed-in-late' ? 'late' : 'present';
      await Attendance.findByIdAndUpdate(existingRecord._id, {
        timeOut: now,
        timeOutLocation: { lat, lng },
        status: finalStatus,
      });

      return NextResponse.json({ success: true, action: 'time-out', status: finalStatus, timeIn: existingRecord.timeIn?.toISOString(), timeOut: now.toISOString() });
    }

    return NextResponse.json({ error: 'Attendance has already been completed.' }, { status: 400 });
  } catch (error: any) {
    console.error('Scan attendance error:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to record attendance' }, { status: 500 });
  }
}
