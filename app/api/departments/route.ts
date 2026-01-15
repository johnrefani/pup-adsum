// app/api/departments/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Department from '@/models/Department';
import { Models } from '@/lib/models';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const departments = await Department.find({}).sort({ acronym: 1 });
    return NextResponse.json({ departments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { acronym, name } = await request.json();

    if (!acronym || !name) {
      return NextResponse.json({ error: 'Acronym and name are required' }, { status: 400 });
    }

    const existing = await Department.findOne({ acronym: acronym.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: 'Department with this acronym already exists' }, { status: 409 });
    }

    const department = await Department.create({
      acronym: acronym.toUpperCase(),
      name: name.trim(),
    });

    return NextResponse.json({ department }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add department' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, acronym, name } = await request.json();

    if (!id || !acronym || !name) {
      return NextResponse.json({ error: 'ID, acronym and name are required' }, { status: 400 });
    }

    const department = await Department.findByIdAndUpdate(
      id,
      { acronym: acronym.toUpperCase(), name: name.trim() },
      { new: true }
    );

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ department });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('sessionToken')?.value;
    if (!currentToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete department' }, { status: 500 });
  }
}