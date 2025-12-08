import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import QRCode from 'qrcode';
import cloudinary from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.254.184:3000';

// ==================== POST (Create Session + QR) ====================
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const data = await request.json();

    const { title, date, startTime, endTime, description, department } = data;

    if (!title || !date || !startTime || !endTime || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tokenPart = uuidv4().replace(/-/g, '').slice(0, 20);
    const qrToken = `sess_${tokenPart}`;
    const scanUrl = `${BASE_URL}/scan/${qrToken}`;

    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 1000,
      margin: 3,
      color: { dark: '#8B0000', light: '#FFFFFF' },
    });

    const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
      folder: 'attendance-qr',
      public_id: qrToken,
      format: 'png',
    });

    const session = await Session.create({
      title,
      date: new Date(date),
      startTime,
      endTime,
      description: description || '',
      department,
      qrToken,
      qrImageUrl: uploadResult.secure_url,
    });

    const members = await User.find({ role: 'member', department }).select('_id');
    const records = members.map((m: any) => ({
      session: session._id,
      member: m._id,
      timeIn: null,
      status: null,
    }));

    if (records.length > 0) {
      await Attendance.insertMany(records);
    }

    return NextResponse.json({
      success: true,
      session: {
        _id: session._id.toString(),
        title: session.title,
        date: session.date.toISOString().split('T')[0],
        startTime: session.startTime,
        endTime: session.endTime,
        description: session.description,
        department: session.department.toString(),
      },
      qrImageUrl: uploadResult.secure_url,
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
    await connectToDatabase();

    const url = new URL(request.url);
    const adminDeptId = url.searchParams.get('department');

    const sessions = await Session.find(
      adminDeptId ? { department: adminDeptId } : {}
    )
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
    await connectToDatabase();
    const data = await request.json();
    const { sessionId, ...updates } = data;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = await Session.findByIdAndUpdate(
      sessionId,
      {
        title: updates.title,
        date: new Date(updates.date),
        startTime: updates.startTime,
        endTime: updates.endTime,
        description: updates.description || '',
        department: updates.department,
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