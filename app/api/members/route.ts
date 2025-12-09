import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const admin = await getCurrentAdmin();
    if (!admin || !admin.department) {
      return NextResponse.json({ students: [] });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course');
    const yearLevelRaw = searchParams.get('year');
    const name = searchParams.get('name')?.trim();

    const query: any = {
      role: 'member',
      department: admin.department,
    };

    if (courseId && yearLevelRaw) {
      query.course = courseId;

      const yearMap: Record<string, string> = {
        '1st Year': '1',
        '2nd Year': '2',
        '3rd Year': '3',
        '4th Year': '4',
      };
      query.yearLevel = yearMap[yearLevelRaw] || yearLevelRaw;
    }

    if (name && courseId && yearLevelRaw) {
      query.fullName = { $regex: name, $options: 'i' };
    }

    const students = await User.find(query)
      .populate({
        path: 'course',
        select: '_id acronym name',
        match: { department: admin.department },
      })
      .select('fullName idNumber username course yearLevel')
      .sort({ fullName: 1 })
      .lean();

    const formatted = students
      .filter((s: any) => s.course !== null)
      .map((s: any) => ({
        id: s._id.toString(),
        fullName: s.fullName,
        idNumber: s.idNumber,
        username: s.username,
        course: s.course.acronym || s.course.name || 'Unknown',
        courseId: s.course._id.toString(),
        yearLevel: `${s.yearLevel}${getYearSuffix(s.yearLevel)} Year`,
      }));

    return NextResponse.json({ students: formatted });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ students: [] });
  }
}

function getYearSuffix(year: string) {
  switch (year) {
    case '1': return 'st';
    case '2': return 'nd';
    case '3': return 'rd';
    default: return 'th';
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const admin = await getCurrentAdmin();
    if (!admin || !admin.department) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fullName, idNumber, username, password, course, yearLevel } = await request.json();

    if (!fullName || !idNumber || !username || !password || !course || !yearLevel) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await User.findOne({ username }, { idNumber });
    if (existing) {
      return NextResponse.json({ error: 'Username or ID Number already exists' }, { status: 409 });
    }

    const newMember = await User.create({
      fullName: fullName.trim(),
      idNumber: idNumber.trim(),
      username: username.trim(),
      password: password.trim(),
      role: 'member',
      department: admin.department,
      course: new mongoose.Types.ObjectId(course),
      yearLevel,
      profilePicture: null,
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add member' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const admin = await getCurrentAdmin();
    if (!admin || !admin.department) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, fullName, idNumber, username, password, course, yearLevel } = await request.json();

    if (!id) return NextResponse.json({ error: 'Member ID required' }, { status: 400 });

    const updateData: any = {
      fullName: fullName.trim(),
      idNumber: idNumber.trim(),
      username: username.trim(),
      course: new mongoose.Types.ObjectId(course),
      yearLevel,
    };

    if (password?.trim()) updateData.password = password.trim();

    const conflict = await User.findOne({
      _id: { $ne: id },
      $or: [{ username }, { idNumber }],
    });
    if (conflict) {
      return NextResponse.json({ error: 'Username or ID Number already in use' }, { status: 409 });
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const admin = await getCurrentAdmin();
    if (!admin || !admin.department) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const member = await User.findOne({
      _id: id,
      role: 'member',
      department: admin.department,
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found or access denied' }, { status: 404 });
    }

    await User.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}