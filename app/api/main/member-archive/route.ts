import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';

async function getCurrentMainAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return null;

  await connectToDatabase();
  return User.findOne({ currentSessionToken: sessionToken, role: 'main' }).select('_id');
}

async function deleteExpiredGraduates() {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  await User.deleteMany({
    role: 'member',
    yearLevel: null,
    graduatedAt: { $lte: cutoff },
  });
}

export async function GET(request: Request) {
  try {
    const admin = await getCurrentMainAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await deleteExpiredGraduates();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const department = searchParams.get('department')?.trim();
    const course = searchParams.get('course')?.trim();

    const query: Record<string, unknown> = {
      role: 'member',
      yearLevel: null,
    };

    if (search) query.fullName = { $regex: search, $options: 'i' };
    if (department) query.department = department;
    if (course) query.course = course;

    const members = await User.find(query)
      .populate('department', 'acronym name')
      .populate('course', 'acronym name yearRange')
      .select('fullName idNumber username department course yearLevel graduatedAt')
      .sort({ fullName: 1 })
      .lean();

    return NextResponse.json({
      members: members.map((member) => ({
        id: String(member._id),
        fullName: member.fullName,
        idNumber: member.idNumber,
        username: member.username,
        department: member.department
          ? `${member.department.acronym} - ${member.department.name}`
          : 'Unknown',
        departmentId: member.department?._id?.toString() || '',
        course: member.course
          ? `${member.course.acronym} - ${member.course.name}`
          : 'Unknown',
        courseId: member.course?._id?.toString() || '',
        courseYearRange: member.course?.yearRange || 4,
        graduatedAt: member.graduatedAt?.toISOString() || null,
        status: 'Graduated',
      })),
    });
  } catch (error) {
    console.error('GET /api/main/member-archive error:', error);
    return NextResponse.json({ error: 'Failed to load member archive' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentMainAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, yearLevel } = await request.json();

    if (!id || !yearLevel) {
      return NextResponse.json({ error: 'Member and year level are required' }, { status: 400 });
    }

    const member = await User.findOne({ _id: id, role: 'member' }).select('course');
    if (!member) {
      return NextResponse.json({ error: 'Archived member not found' }, { status: 404 });
    }

    const course = await Course.findById(member.course).select('yearRange');
    const maxYear = course?.yearRange || 4;
    const parsedYearLevel = Number(yearLevel);

    if (!Number.isInteger(parsedYearLevel) || parsedYearLevel < 1 || parsedYearLevel > maxYear) {
      return NextResponse.json(
        { error: `Year level must be from 1 to ${maxYear}` },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(id, {
      yearLevel: String(parsedYearLevel),
      graduatedAt: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/main/member-archive error:', error);
    return NextResponse.json({ error: 'Failed to restore member' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getCurrentMainAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Select at least one archived member' }, { status: 400 });
    }

    const result = await User.deleteMany({
      _id: { $in: ids },
      role: 'member',
      yearLevel: null,
    });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('DELETE /api/main/member-archive error:', error);
    return NextResponse.json({ error: 'Failed to delete archived members' }, { status: 500 });
  }
}
