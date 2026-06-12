import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import QRCode from 'qrcode';
import cloudinary from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { Models } from '@/lib/models';
import { cookies } from 'next/headers';
import SystemSettings from '@/models/SystemSettings';

const getBaseUrl = (request: NextRequest) =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  request.nextUrl.origin;

// ==================== POST (Create Session + QR) ====================
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    // Get logged-in user
    const user = await User.findOne({ currentSessionToken: currentToken, role: 'admin' });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const {
      title,
      date,
      startTime,
      endTime,
      description,
      gracePeriodMinutes = 15,
      absentAfterMinutes = 30,
      startTimeOutBeforeEndMinutes = 0,
      timeOutLimitMinutes = 30,
      venueLat,
      venueLng,
      allowedRadiusMeters = 0,
    } = data;

    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const timingValues = [gracePeriodMinutes, absentAfterMinutes, startTimeOutBeforeEndMinutes, timeOutLimitMinutes].map(Number);
    const venueLatitude = venueLat !== undefined && venueLat !== '' ? Number(venueLat) : undefined;
    const venueLongitude = venueLng !== undefined && venueLng !== '' ? Number(venueLng) : undefined;
    const allowedRadius = Number(allowedRadiusMeters ?? 0);

    if (timingValues.some((value) => !Number.isFinite(value) || value < 0)) {
      return NextResponse.json({ error: 'Timing limits must be zero or greater' }, { status: 400 });
    }

    if ((venueLatitude !== undefined && venueLongitude === undefined) ||
        (venueLatitude === undefined && venueLongitude !== undefined)) {
      return NextResponse.json({ error: 'Both venue latitude and longitude are required when setting a location' }, { status: 400 });
    }

    if (venueLatitude !== undefined && venueLongitude !== undefined && (!Number.isFinite(venueLatitude) || !Number.isFinite(venueLongitude))) {
      return NextResponse.json({ error: 'Venue coordinates must be valid numbers' }, { status: 400 });
    }

    if (!Number.isFinite(allowedRadius) || allowedRadius < 0) {
      return NextResponse.json({ error: 'Allowed radius must be zero or greater' }, { status: 400 });
    }

    // Use user's department
    const department = user.department;
    if (!department) {
      return NextResponse.json({ error: 'User has no department assigned' }, { status: 400 });
    }

    // Generate QR token
    const tokenPart = uuidv4().replace(/-/g, '').slice(0, 20);
    const qrToken = `sess_${tokenPart}`;
    const scanUrl = `${getBaseUrl(request)}/scan/${qrToken}`;

    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 1000,
      margin: 3,
      color: { dark: '#8B0000', light: '#FFFFFF' },
    });

    let qrImageUrl = qrDataUrl;
    const hasCloudinaryConfig =
      Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
      Boolean(process.env.CLOUDINARY_API_KEY) &&
      Boolean(process.env.CLOUDINARY_API_SECRET);

    if (hasCloudinaryConfig) {
      try {
        const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
          folder: 'pup-adsum/attendance-qr',
          public_id: qrToken,
          format: 'png',
        });
        qrImageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.warn('Cloudinary QR upload failed. Using inline QR image instead.', uploadError);
      }
    }

    const settings = await SystemSettings.findOne({ key: 'academic' }).select('schoolYear semester');

    const venueLocation = venueLatitude !== undefined && venueLongitude !== undefined
      ? { lat: venueLatitude, lng: venueLongitude }
      : undefined;

    const session = await Session.create({
      title,
      date: new Date(date),
      startTime,
      endTime,
      description: description || '',
      department, // <-- store user's department automatically
      semester: settings?.semester || '1st Semester',
      schoolYear: settings?.schoolYear || '',
      gracePeriodMinutes: timingValues[0],
      absentAfterMinutes: Math.max(timingValues[1], timingValues[0]),
      startTimeOutBeforeEndMinutes: timingValues[2],
      timeOutLimitMinutes: timingValues[3],
      venueLocation,
      allowedRadiusMeters: allowedRadius,
      qrToken,
      qrImageUrl,
    });

    // Create attendance records for members in the same department
    const members = await User.find({ role: 'member', department, yearLevel: { $ne: null } }).select('_id');
    const records = members.map((m: any) => ({
      session: session._id,
      member: m._id,
      timeIn: null,
      status: null,
    }));

    if (records.length > 0) {
      await Attendance.insertMany(records);
    }

    const populatedSession = await Session.findById(session._id)
      .populate<{ department: { _id: string; acronym: string; name: string } }>(
        'department',
        'acronym name'
      )
      .lean<{
        _id: string;
        title: string;
        date: Date;
        startTime: string;
        endTime: string;
        description?: string;
        semester?: string;
        schoolYear?: string;
        gracePeriodMinutes?: number;
        absentAfterMinutes?: number;
        startTimeOutBeforeEndMinutes?: number;
        timeOutLimitMinutes?: number;
        venueLocation?: { lat: number; lng: number };
        allowedRadiusMeters?: number;
        department: { _id: string; acronym: string; name: string };
      }>()
      .exec();

    if (!populatedSession) {
      throw new Error('Failed to retrieve created session');
    }

    return NextResponse.json({
      success: true,
      session: {
        _id: populatedSession._id.toString(),
        title: populatedSession.title,
        date: populatedSession.date.toISOString().split('T')[0],
        startTime: populatedSession.startTime,
        endTime: populatedSession.endTime,
        description: populatedSession.description || '',
        semester: populatedSession.semester || '1st Semester',
        schoolYear: populatedSession.schoolYear || '',
        gracePeriodMinutes: populatedSession.gracePeriodMinutes ?? 15,
        absentAfterMinutes: populatedSession.absentAfterMinutes ?? 30,
        startTimeOutBeforeEndMinutes: populatedSession.startTimeOutBeforeEndMinutes ?? 0,
        timeOutLimitMinutes: populatedSession.timeOutLimitMinutes ?? 30,
        venueLocation: populatedSession.venueLocation || null,
        allowedRadiusMeters: populatedSession.allowedRadiusMeters ?? 0,
        department: populatedSession.department._id.toString(),
        departmentLabel: `${populatedSession.department.acronym} - ${populatedSession.department.name}`,
      },
      qrImageUrl,
    });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}


// ==================== GET (List Sessions) ====================
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const admin = await User.findOne({ currentSessionToken: currentToken, role: 'admin' })
      .select('department')
      .lean<{ department: unknown }>();
    if (!admin?.department) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await Session.find({ department: admin.department })
      .populate('department', 'acronym name')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const formatted = sessions.map((s: any) => ({
      _id: s._id.toString(),
      title: s.title,
      date: s.date.toISOString().split('T')[0],
      startTime: s.startTime,
      endTime: s.endTime,
      description: s.description || '',
      semester: s.semester || '1st Semester',
      schoolYear: s.schoolYear || '',
      gracePeriodMinutes: s.gracePeriodMinutes ?? 15,
      absentAfterMinutes: s.absentAfterMinutes ?? 30,
      startTimeOutBeforeEndMinutes: s.startTimeOutBeforeEndMinutes ?? 0,
      timeOutLimitMinutes: s.timeOutLimitMinutes ?? 30,
      venueLocation: s.venueLocation ?? null,
      allowedRadiusMeters: s.allowedRadiusMeters ?? 0,
      department: s.department._id.toString(),
      departmentLabel: `${s.department.acronym} - ${s.department.name}`,
      qrImageUrl: s.qrImageUrl,
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error: any) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// ==================== PATCH (Update Session) ====================
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const admin = await User.findOne({ currentSessionToken: currentToken, role: 'admin' })
      .select('department')
      .lean<{ department: unknown }>();
    if (!admin?.department) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { sessionId, ...updates } = data;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const venueLatitude = updates.venueLat !== undefined && updates.venueLat !== '' ? Number(updates.venueLat) : undefined;
    const venueLongitude = updates.venueLng !== undefined && updates.venueLng !== '' ? Number(updates.venueLng) : undefined;
    const allowedRadius = Number(updates.allowedRadiusMeters ?? 0);

    if ((venueLatitude !== undefined && venueLongitude === undefined) ||
        (venueLatitude === undefined && venueLongitude !== undefined)) {
      return NextResponse.json({ error: 'Both venue latitude and longitude are required when setting or clearing a location' }, { status: 400 });
    }

    const venueLocation = venueLatitude !== undefined && venueLongitude !== undefined
      ? { lat: venueLatitude, lng: venueLongitude }
      : (updates.venueLat === '' && updates.venueLng === '' ? null : undefined);

    const timingValues = [
      updates.gracePeriodMinutes ?? 15,
      updates.absentAfterMinutes ?? 30,
      updates.startTimeOutBeforeEndMinutes ?? 0,
      updates.timeOutLimitMinutes ?? 30,
    ].map(Number);

    if (timingValues.some((value) => !Number.isFinite(value) || value < 0)) {
      return NextResponse.json({ error: 'Timing limits must be zero or greater' }, { status: 400 });
    }

    if (!Number.isFinite(allowedRadius) || allowedRadius < 0) {
      return NextResponse.json({ error: 'Allowed radius must be zero or greater' }, { status: 400 });
    }

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, department: admin.department },
      {
        title: updates.title,
        date: new Date(updates.date),
        startTime: updates.startTime,
        endTime: updates.endTime,
        description: updates.description || '',
        department: admin.department,
        gracePeriodMinutes: timingValues[0],
        absentAfterMinutes: Math.max(timingValues[1], timingValues[0]),
        startTimeOutBeforeEndMinutes: timingValues[2],
        timeOutLimitMinutes: timingValues[3],
        venueLocation,
        allowedRadiusMeters: allowedRadius,
      },
      { new: true }
    ).populate('department', 'acronym name');

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error('Session update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}

// ==================== DELETE (Delete session and related attendance + Cloudinary QR) ====================
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const admin = await User.findOne({ currentSessionToken: currentToken, role: 'admin' })
      .select('department')
      .lean<{ department: unknown }>();
    if (!admin?.department) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { sessionId } = data;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = await Session.findOne({ _id: sessionId, department: admin.department });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.qrToken) {
      try {
        await cloudinary.uploader.destroy(`pup-adsum/attendance-qr/${session.qrToken}`);
      } catch (err) {
        console.error('Failed to delete Cloudinary QR image:', err);
      }
    }

    await Attendance.deleteMany({ session: session._id });
    await Session.findByIdAndDelete(session._id);

    return NextResponse.json({ success: true, deletedSessionId: sessionId });
  } catch (error: any) {
    console.error('Session delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete session' }, { status: 500 });
  }
}
