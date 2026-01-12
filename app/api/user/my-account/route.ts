import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import cloudinary from '@/lib/cloudinary';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { Models } from '@/lib/models';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const username = cookieStore.get('authUser')?.value;
  if (!username) return null;

  await connectToDatabase();
  return await User.findOne({ username, role: 'member' })
    .populate('department', 'acronym name')
    .populate('course', 'acronym name');
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    fullName: user.fullName,
    schoolId: user.idNumber,
    username: user.username,
    yearLevel: user.yearLevel,
    profilePicture: user.profilePicture || null,

    departmentFormatted: user.department
      ? `${user.department.acronym} (${user.department.name})`
      : '—',
    courseFormatted: user.course
      ? `${user.course.acronym} (${user.course.name})`
      : '—',
  });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const username = formData.get('username') as string | null;
  const fullName = formData.get('fullName') as string | null;
  const password = formData.get('password') as string | null;
  const photoFile = formData.get('photo') as File | null;

  const updates: any = {};

  if (username && username.trim() !== user.username) {
    const existing = await User.findOne({ username: username.trim(), _id: { $ne: user._id } });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }
    updates.username = username.trim();
  }


  if (fullName && fullName.trim() !== user.fullName) {
    updates.fullName = fullName.trim();
  }


  if (password && password.trim()) {
    updates.password = password.trim();
  }


  if (photoFile && photoFile.size > 0) {
    const buffer = Buffer.from(await photoFile.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'profile-pictures', public_id: user._id.toString(), overwrite: true },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // @ts-ignore
    updates.profilePicture = uploadResult.secure_url;

    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`profile-pictures/${publicId}`);
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: 'No changes made' });
  }

  await User.findByIdAndUpdate(user._id, updates);

  return NextResponse.json({ message: 'Profile updated successfully!' });
}