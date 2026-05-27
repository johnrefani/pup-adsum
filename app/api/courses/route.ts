// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Course from '@/models/Course';
import Department from '@/models/Department';
import { Models } from '@/lib/models';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const courses = await Course.find({})
      .populate('department', 'name acronym')
      .sort({ acronym: 1 })
      .lean();

    const formatted = courses.map((c: any) => ({
      id: c._id.toString(),
      code: c.acronym,
      name: c.name,
      department: c.department?.name || 'Unknown',
      departmentId: c.department?._id?.toString() || '',
      departmentAcronym: c.department?.acronym || '',
      yearRange: c.yearRange || 4,
    }));

    return NextResponse.json({ courses: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { acronym, name, departmentName, yearRange } = await request.json();

    if (!acronym || !name || !departmentName || !yearRange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedYearRange = Number(yearRange);
    if (!Number.isInteger(parsedYearRange) || parsedYearRange < 1 || parsedYearRange > 5) {
      return NextResponse.json({ error: 'Year range must be from 1 to 5' }, { status: 400 });
    }

    await connectToDatabase();

    const department = await Department.findOne({ name: departmentName });
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const newCourse = await Course.create({
      acronym: acronym.trim().toUpperCase(),
      name: name.trim(),
      department: department._id,
      yearRange: parsedYearRange,
    });

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Course acronym already exists' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}


export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, acronym, name, departmentName, yearRange } = await request.json();

    if (!id || !acronym || !name || !departmentName || !yearRange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedYearRange = Number(yearRange);
    if (!Number.isInteger(parsedYearRange) || parsedYearRange < 1 || parsedYearRange > 5) {
      return NextResponse.json({ error: 'Year range must be from 1 to 5' }, { status: 400 });
    }

    await connectToDatabase();

    const department = await Department.findOne({ name: departmentName });
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        acronym: acronym.trim().toUpperCase(),
        name: name.trim(),
        department: department._id,
        yearRange: parsedYearRange,
      },
      { new: true }
    );

    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course: updatedCourse });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Course acronym already exists' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
