import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import Session from '@/models/Session';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import {
  ScanSuccess,
  ScanAlreadyPresent,
  WrongDepartmentWarning,
  SessionEndedMessage,
  SessionNotStartedYet,
  InvalidQRMessage,
} from '@/lib/imports';
import ScanLocationConfirmation from '@/components/scan/ScanLocationConfirmation';

export const dynamic = 'force-dynamic';

type ScanStatus = 'present' | 'absent' | 'unfinished' | 'late' | 'timed-in' | 'timed-in-late' | 'late-unfinished';

export interface SessionForClient {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  departmentName?: string;
  venueLocation?: { lat: number; lng: number } | null;
  allowedRadiusMeters?: number;
  gracePeriodMinutes?: number;
  absentAfterMinutes?: number;
  startTimeOutBeforeEndMinutes?: number;
  timeOutLimitMinutes?: number;
}

export default async function ScanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length < 10) {
    return <InvalidQRMessage message="Invalid or missing QR code" />;
  }

  const cookieStore = await cookies();
  const authUser = cookieStore.get('sessionToken')?.value;

  if (!authUser) {
    redirect(`/?redirectTo=${encodeURIComponent(`/scan/${token}`)}`);
  }

  await connectToDatabase();

  const user = await User.findOne({ currentSessionToken: authUser })
    .populate('department', 'acronym name')
    .select('fullName department role')
    .lean<{
      _id: string;
      fullName: string;
      role: string;
      department?: { _id: string; acronym?: string; name?: string };
    }>();

  if (!user || user.role !== 'member') {
    redirect('/dashboard');
  }

  const sessionDoc = await Session.findOne({ qrToken: token })
    .select('title date startTime endTime description department gracePeriodMinutes absentAfterMinutes startTimeOutBeforeEndMinutes timeOutLimitMinutes venueLocation allowedRadiusMeters')
    .populate('department', 'acronym name')
    .lean<{
      _id: string;
      title: string;
      date: Date;
      startTime: string;
      endTime: string;
      description?: string;
      gracePeriodMinutes?: number;
      absentAfterMinutes?: number;
      startTimeOutBeforeEndMinutes?: number;
      timeOutLimitMinutes?: number;
      department: { _id: string; name: string; acronym: string };
    }>();

  if (!sessionDoc) {
    return <InvalidQRMessage message="Session not found" token={token} />;
  }

  const userDeptId = user.department?._id?.toString();
  const sessionDeptId = sessionDoc.department._id.toString();

  if (userDeptId !== sessionDeptId) {
    return (
      <WrongDepartmentWarning
        sessionTitle={sessionDoc.title}
        sessionDept={sessionDoc.department.acronym || sessionDoc.department.name}
        userDept={user.department?.acronym || user.department?.name || 'Not Assigned'}
      />
    );
  }

  const session: SessionForClient = {
    _id: sessionDoc._id.toString(),
    title: sessionDoc.title,
    date: sessionDoc.date.toISOString(),
    startTime: sessionDoc.startTime,
    endTime: sessionDoc.endTime,
    description: sessionDoc.description,
    departmentName: sessionDoc.department.acronym || sessionDoc.department.name,
    venueLocation: sessionDoc.venueLocation || null,
    allowedRadiusMeters: sessionDoc.allowedRadiusMeters ?? 0,
    gracePeriodMinutes: sessionDoc.gracePeriodMinutes ?? 15,
    absentAfterMinutes: sessionDoc.absentAfterMinutes ?? 30,
    startTimeOutBeforeEndMinutes: sessionDoc.startTimeOutBeforeEndMinutes ?? 0,
    timeOutLimitMinutes: sessionDoc.timeOutLimitMinutes ?? 30,
  };

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const sessionDate = session.date.split('T')[0];
  const sessionStartTime = new Date(`${sessionDate}T${session.startTime}:00`);
  const sessionEndTime = new Date(`${sessionDate}T${session.endTime}:00`);

  if (now < sessionStartTime) {
    return <SessionNotStartedYet session={session} />;
  }

  const existingRecord = await Attendance.findOne({
    session: sessionDoc._id,
    member: user._id,
  });

  const timeOutDeadline = new Date(sessionEndTime);
  timeOutDeadline.setMinutes(timeOutDeadline.getMinutes() + (session.timeOutLimitMinutes ?? 30));
  const timeOutStartTime = new Date(sessionEndTime);
  timeOutStartTime.setMinutes(timeOutStartTime.getMinutes() - (session.startTimeOutBeforeEndMinutes ?? 0));

  if (existingRecord?.timeIn && existingRecord?.timeOut) {
    return (
      <ScanAlreadyPresent
        session={session}
        timeIn={existingRecord.timeIn}
        timeOut={existingRecord.timeOut}
      />
    );
  }

  if (existingRecord?.timeIn && !existingRecord?.timeOut) {
    if (existingRecord.status === 'absent') {
      return (
        <ScanAlreadyPresent
          session={session}
          timeIn={existingRecord.timeIn}
          message="Your time-in was recorded after the allowed absent threshold. Your attendance remains marked as absent."
        />
      );
    }

    if (now < timeOutStartTime) {
      return (
        <ScanAlreadyPresent
          session={session}
          timeIn={existingRecord.timeIn}
          message={`You can time out starting at ${timeOutStartTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}.`}
        />
      );
    }

    if (now > timeOutDeadline) {
      const unfinishedStatus = existingRecord.status === 'timed-in-late'
        ? 'late-unfinished'
        : 'unfinished';
      await Attendance.findByIdAndUpdate(existingRecord._id, { status: unfinishedStatus });
      return (
        <ScanAlreadyPresent
          session={session}
          timeIn={existingRecord.timeIn}
          message={unfinishedStatus === 'late-unfinished'
            ? "Time-out limit has passed. Your attendance is late and unfinished."
            : "Time-out limit has passed. Your attendance is unfinished."}
        />
      );
    }

    return (
      <ScanLocationConfirmation
        token={token}
        session={session}
        user={{ fullName: user.fullName }}
        action="time-out"
      />
    );
  }

  if (now > sessionEndTime) {
    await Attendance.findOneAndUpdate(
      { session: sessionDoc._id, member: user._id },
      { $set: { status: 'absent' } },
      { upsert: true }
    );
    return <SessionEndedMessage session={session} />;
  }

  return (
    <ScanLocationConfirmation
      token={token}
      session={session}
      user={{ fullName: user.fullName }}
      action="time-in"
    />
  );
}
