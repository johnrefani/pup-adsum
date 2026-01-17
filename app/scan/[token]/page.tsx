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
  InvalidQRMessage 
} from '@/lib/imports';

export const dynamic = 'force-dynamic';

export interface SessionForClient {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  departmentName?: string;
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

  let user: any = null;
  try {
    await connectToDatabase();
    user = await User.findOne({ currentSessionToken: authUser })
      .populate('department', 'acronym name')
      .select('fullName department role')
      .lean();

    if (!user || user.role !== 'member') {
      redirect('/dashboard');
    }
  } catch (err) {
    console.error('Failed to fetch user:', err);
    redirect('/?error=db');
  }

  const sessionDoc = await Session.findOne({ qrToken: token })
    .select('title date startTime endTime description department')
    .populate('department', 'acronym name')
    .lean<{
      _id: any;
      title: string;
      date: Date;
      startTime: string;
      endTime: string;
      description?: string;
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
  };

  const now = new Date();

  // ——— END TIME CHECK ———
  const [endHour, endMinute] = session.endTime.split(':');
  const sessionEndTime = new Date(session.date);
  sessionEndTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

  if (now > sessionEndTime) {
    return <SessionEndedMessage session={session} />;
  }

  // ——— NEW: START TIME CHECK ———
  const [startHour, startMinute] = session.startTime.split(':');
  const sessionStartTime = new Date(session.date);
  sessionStartTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

  if (now < sessionStartTime) {
    return <SessionNotStartedYet session={session} />;
  }
  // ————————————————

  const existingRecord = await Attendance.findOne({
    session: sessionDoc._id,
    member: user._id,
  });

  if (existingRecord?.timeIn) {
    return <ScanAlreadyPresent session={session} timeIn={existingRecord.timeIn} />;
  }

  const timeIn = new Date();
  await Attendance.findOneAndUpdate(
    { session: sessionDoc._id, member: user._id },
    { $set: { timeIn, status: 'present', timeOut: null } },
    { upsert: true }
  );

  return <ScanSuccess session={session} timeIn={timeIn} user={user} />;
}