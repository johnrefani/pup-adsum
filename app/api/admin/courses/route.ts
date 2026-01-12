import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Course from '@/models/Course';
import { cookies } from 'next/headers';
import User from '@/models/User';
import { Models } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const username = cookieStore.get('authUser')?.value;

    const admin = await User.findOne({ username, role: 'admin' }).select('department');
    if (!admin) return NextResponse.json({ courses: [] });

    const courses = await Course.find({ department: admin.department }).sort({ name: 1 });

    return NextResponse.json({
      courses: courses.map((c: any) => ({
        value: c._id.toString(),
        label: c.acronym || c.name,
      })),
    });
  } catch (error) {
    return NextResponse.json({ courses: [] });
  }
}