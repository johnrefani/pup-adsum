import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import Course from '@/models/Course';
import Department from '@/models/Department';
import SystemSettings from '@/models/SystemSettings';
import User from '@/models/User';
import { hashPassword, isHashedPassword, verifyPassword } from '@/lib/password';

const SETTINGS_KEY = 'academic';
const SEMESTERS = ['1st Semester', '2nd Semester'];

type MemberYearRecord = {
  _id: unknown;
  yearLevel?: string;
  course?: {
    yearRange?: number;
  } | null;
};

type YearLevelSnapshot = Array<{
  member: string;
  yearLevel: string | null;
}>;

function defaultSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-${year + 1}`;
}

function startYear(schoolYear: string) {
  const match = schoolYear.match(/^(\d{4})-\d{4}$/);
  return match ? Number(match[1]) : null;
}

function isValidSchoolYear(schoolYear: string) {
  const match = schoolYear.match(/^(\d{4})-(\d{4})$/);
  if (!match) return false;
  return Number(match[2]) === Number(match[1]) + 1;
}

async function getCurrentMainAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;
  if (!sessionToken) return null;

  await connectToDatabase();
  return User.findOne({ currentSessionToken: sessionToken, role: 'main' }).select('_id password');
}

async function getSettings() {
  return SystemSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $setOnInsert: {
        key: SETTINGS_KEY,
        schoolYear: defaultSchoolYear(),
        semester: '1st Semester',
      },
    },
    { upsert: true, new: true }
  );
}

async function adjustMemberYears(delta: number) {
  if (delta === 0) return 0;

  const members = await User.find({ role: 'member' })
    .populate('course', 'yearRange')
    .select('yearLevel course')
    .lean();

  const updates = (members as MemberYearRecord[])
    .flatMap((member) => {
      const currentYear = Number(member.yearLevel);
      const maxYear = Number(member.course?.yearRange || 4);
      const nextYear =
        delta > 0
          ? currentYear >= maxYear
            ? null
            : Math.min(currentYear + delta, maxYear)
          : Math.max(currentYear + delta, 1);

      if (!currentYear || nextYear === currentYear) return [];

      return [{
        updateOne: {
          filter: { _id: member._id },
          update: {
            $set: {
              yearLevel: nextYear === null ? null : String(nextYear),
              graduatedAt: nextYear === null ? new Date() : null,
            },
          },
        },
      }];
    });

  if (updates.length === 0) return 0;

  const result = await User.bulkWrite(updates);
  return result.modifiedCount;
}

async function captureMemberYearSnapshot(): Promise<YearLevelSnapshot> {
  const members = await User.find({ role: 'member' })
    .select('yearLevel')
    .lean();

  return members.map((member: { _id: unknown; yearLevel?: string }) => ({
    member: String(member._id),
    yearLevel: member.yearLevel || null,
  }));
}

async function restoreMemberYearSnapshot(snapshot: YearLevelSnapshot) {
  const updates = snapshot.map((item) => ({
    updateOne: {
      filter: { _id: item.member, role: 'member' },
      update: {
        $set: {
          yearLevel: item.yearLevel,
          graduatedAt: item.yearLevel === null ? new Date() : null,
        },
      },
    },
  }));

  if (updates.length === 0) return 0;

  const result = await User.bulkWrite(updates);
  return result.modifiedCount;
}

export async function GET() {
  try {
    const admin = await getCurrentMainAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [settings, organizationCount, programCount] = await Promise.all([
      getSettings(),
      Department.countDocuments(),
      Course.countDocuments(),
    ]);

    return NextResponse.json({
      schoolYear: settings.schoolYear,
      semester: settings.semester,
      counts: {
        organizations: organizationCount,
        programs: programCount,
      },
    });
  } catch (error) {
    console.error('GET /api/main/settings error:', error);
    return NextResponse.json({ error: 'Failed to load master settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentMainAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { schoolYear, semester, masterPassword } = await request.json();

    if (!masterPassword || !verifyPassword(masterPassword, admin.password)) {
      return NextResponse.json({ error: 'Incorrect master admin password' }, { status: 401 });
    }

    if (!isHashedPassword(admin.password)) {
      await User.findByIdAndUpdate(admin._id, { password: hashPassword(masterPassword) });
    }

    const settings = await getSettings();
    const updates: Record<string, unknown> = {};
    let adjustedMembers = 0;

    if (schoolYear !== undefined) {
      if (!isValidSchoolYear(schoolYear)) {
        return NextResponse.json(
          { error: 'School year must use YYYY-YYYY and end one year after it starts' },
          { status: 400 }
        );
      }

      const currentStart = startYear(settings.schoolYear);
      const nextStart = startYear(schoolYear);

      if (currentStart !== null && nextStart !== null && schoolYear !== settings.schoolYear) {
        const snapshots = (settings.yearLevelSnapshots || {}) as Record<string, YearLevelSnapshot>;
        updates[`yearLevelSnapshots.${settings.schoolYear}`] = await captureMemberYearSnapshot();

        if (snapshots[schoolYear]) {
          adjustedMembers = await restoreMemberYearSnapshot(snapshots[schoolYear]);
        } else {
          adjustedMembers = await adjustMemberYears(nextStart - currentStart);
        }
      }

      updates.schoolYear = schoolYear;
    }

    if (semester !== undefined) {
      if (!SEMESTERS.includes(semester)) {
        return NextResponse.json({ error: 'Invalid semester' }, { status: 400 });
      }
      updates.semester = semester;
    }

    if (Object.keys(updates).length > 0) {
      await SystemSettings.updateOne({ key: SETTINGS_KEY }, { $set: updates });
    }

    const nextSettings = await getSettings();

    return NextResponse.json({
      success: true,
      schoolYear: nextSettings.schoolYear,
      semester: nextSettings.semester,
      adjustedMembers,
      promotedMembers: adjustedMembers,
    });
  } catch (error) {
    console.error('PATCH /api/main/settings error:', error);
    return NextResponse.json({ error: 'Failed to update master settings' }, { status: 500 });
  }
}
