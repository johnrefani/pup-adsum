import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Department from '@/models/Department';

export async function GET() {
  try {
    await connectToDatabase();
    const departments = await Department.find({}).sort({ acronym: 1 });
    return NextResponse.json({ departments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}