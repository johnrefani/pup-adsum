// app/api/admin/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import QRCode from 'qrcode';
import cloudinary from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.254.184:3000';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const data = await request.json();

    const { title, date, startTime, endTime, description, department } = data;

    if (!title || !date || !startTime || !endTime || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique token
    const tokenPart = uuidv4().replace(/-/g, '').slice(0, 20);
    const qrToken = `sess_${tokenPart}`;
    const scanUrl = `${BASE_URL}/scan/${qrToken}`;

    // Generate QR
    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 1000,
      margin: 3,
      color: { dark: '#8B0000', light: '#FFFFFF' },
    });

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
      folder: 'attendance-qr',
      public_id: qrToken,
      format: 'png',
    });

    // Save session with qrToken
    const session = await Session.create({
      title,
      date: new Date(date),
      startTime,
      endTime,
      description: description || '',
      department,
      qrToken,                    // ← This is now saved
      qrImageUrl: uploadResult.secure_url,
    });

    // Create attendance records
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