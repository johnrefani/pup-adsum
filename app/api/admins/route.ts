// app/api/admins/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Department from '@/models/Department';

export async function GET() {
  try {
    await connectToDatabase();
    const admins = await User.find({ role: 'admin' })
      .populate('department', 'name acronym')
      .select('fullName username password department')
      .lean();

    const formatted = admins.map((a: any) => ({
      id: a._id.toString(),
      fullName: a.fullName,
      username: a.username,
      password: a.password,           
      department: a.department?.name || '—',
    }));

    return NextResponse.json({ admins: formatted });
  } catch (error) {
    console.error('GET /api/admins error:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { fullName, username, password, departmentName } = body;

    if (!fullName || !username || !password || !departmentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const Department = (await import('@/models/Department')).default;
    const dept = await Department.findOne({ name: departmentName });
    if (!dept) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const User = (await import('@/models/User')).default;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const newAdmin = new User({
      fullName,
      username,
      password,
      idNumber: null,      
      role: 'admin',
      department: dept._id,
      course: null,
      yearLevel: null,
      profilePicture: null,
    });

    await newAdmin.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Admin created successfully' 
    });

  } catch (error: any) {
    console.error('POST /api/admins error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      return NextResponse.json({ 
        error: field === 'username' 
          ? 'Username already taken' 
          : 'ID Number already exists (for members)' 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: 'Failed to create admin' 
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, fullName, username, password, departmentName } = body;

    if (!id || !fullName || !username || !departmentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dept = await Department.findOne({ name: departmentName });
    if (!dept) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const updateData: any = {
      fullName,
      username,
      department: dept._id,
    };

    if (password && password.trim() !== '') {
      updateData.password = password.trim();
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('fullName username department');

    if (!updatedAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Admin updated successfully' });
  } catch (error: any) {
    console.error('PATCH /api/admins error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admins error:', error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}