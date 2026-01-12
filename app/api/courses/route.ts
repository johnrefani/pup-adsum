// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Course from '@/models/Course';
import Department from '@/models/Department';
import { Models } from '@/lib/models';

export async function GET() {
  try {
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
      departmentAcronym: c.department?.acronym || '',
    }));

    return NextResponse.json({ courses: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const { acronym, name, departmentName } = await request.json();

    if (!acronym || !name || !departmentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
    const { id, acronym, name, departmentName } = await request.json();

    if (!id || !acronym || !name || !departmentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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