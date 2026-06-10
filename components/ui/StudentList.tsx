"use client";
import React, { useEffect, useState } from "react";
import { Button, Status } from "@/lib/imports";
import { formatDisplayDate, formatDisplayTime } from "@/lib/dateTimeFormat";

type Student = {
  _id: string;
  name: string;
  idNumber: string;
  yearLevel: string;
  timeIn: string;
  timeOut: string;
  status:
    | "present"
    | "absent"
    | "unfinished"
    | "late"
    | "timed-in"
    | "timed-in-late"
    | "late-unfinished"
    | null;
};

type Props = {
  sessionId: string;
  courseId: string;
  yearLevel: string;
  search: string;
  sessionInfo: any;
  courseName: string;
};

export default function StudentList({
  sessionId,
  courseId,
  yearLevel,
  search,
  sessionInfo,
  courseName,
}: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const ready = sessionId && courseId && yearLevel;

  const hasSessionEnded = (() => {
    if (!sessionInfo?.date || !sessionInfo?.endTime) return false;

    const sessionDate = String(sessionInfo.date).split('T')[0];
    const sessionEnd = new Date(`${sessionDate}T${sessionInfo.endTime}:00`);
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

    return now > sessionEnd;
  })();

  const formatYearLevel = (value: string) => {
    if (value === 'all') return 'All Year Levels';
    const normalized = value.replace(/\D/g, '') || value;
    const suffix = normalized === '1'
      ? 'st'
      : normalized === '2'
        ? 'nd'
        : normalized === '3'
          ? 'rd'
          : 'th';
    return `${normalized}${suffix} Year`;
  };

  useEffect(() => {
    if (!ready) {
      setStudents([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      sessionId,
      courseId,
      yearLevel,
      search,
    });
    fetch(`/api/admin/attendance-records?${params}`)
      .then((r) => r.json())
      .then((d) => setStudents(d.students || []))
      .finally(() => setLoading(false));
  }, [sessionId, courseId, yearLevel, search, ready]);

  const downloadCSV = () => {
    if (!sessionInfo || students.length === 0) return;

    const allowedStatuses = ['present', 'absent', 'late', 'unfinished'] as const;
    const filteredStudents = students.filter(
      (s): s is Student & { status: typeof allowedStatuses[number] } =>
        s.status !== null && allowedStatuses.includes(s.status as any)
    );

    const statusCounts: Record<typeof allowedStatuses[number], number> = {
      present: 0,
      absent: 0,
      late: 0,
      unfinished: 0,
    };

    filteredStudents.forEach((s) => {
      statusCounts[s.status]++;
    });

    const yearLabel = formatYearLevel(yearLevel);
    let csv = '';

    csv += `"ATTENDANCE SUMMARY REPORT"\r\n`;
    csv += `"Session Title","${sessionInfo.title}"\r\n`;
    csv += `"Date","${formatDisplayDate(sessionInfo.date)}"\r\n`;
    csv += `"Time","${formatDisplayTime(sessionInfo.startTime)} - ${formatDisplayTime(sessionInfo.endTime)}"\r\n`;
    csv += `"Program","${courseName}"\r\n`;
    csv += `"Year Level","${yearLabel}"\r\n`;
    csv += `"Department","${sessionInfo.departmentName || sessionInfo.departmentAcronym}"\r\n`;
    csv += `\r\n`;

    csv += `"MEMBER COUNT BY STATUS"\r\n`;
    csv += `"Status","Count"\r\n`;
    csv += `"Total Members","${filteredStudents.length}"\r\n`;
    Object.entries(statusCounts).forEach(([status, count]) => {
      const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
      csv += `"${displayStatus}","${count}"\r\n`;
    });
    csv += `\r\n\r\n`;

    const headers = ['ID Number', 'Full Name', 'Time-In', 'Time-Out'];
    const writeStatusGroups = (groupedStudents: Student[]) => {
      const groupedByStatus: Record<typeof allowedStatuses[number], Student[]> = {
        present: [],
        absent: [],
        late: [],
        unfinished: [],
      };

      groupedStudents.forEach((student) => {
        if (student.status && allowedStatuses.includes(student.status as any)) {
          groupedByStatus[student.status as typeof allowedStatuses[number]].push(student);
        }
      });

      Object.entries(groupedByStatus).forEach(([status, statusStudents]) => {
        if (statusStudents.length === 0) return;

        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
        csv += `"--- ${displayStatus} (${statusStudents.length}) ---"\r\n`;
        csv += headers.join(',') + '\r\n';

        statusStudents.forEach((s) => {
          const row = [
            s.idNumber,
            s.name,
            s.timeIn,
            s.timeOut,
          ];
          csv += row.map((cell) => `"${cell}"`).join(',') + '\r\n';
        });
        csv += `\r\n`;
      });
    };

    if (yearLevel === 'all') {
      const yearGroups = filteredStudents.reduce<Record<string, Student[]>>((acc, student) => {
        const key = student.yearLevel || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(student);
        return acc;
      }, {});

      Object.entries(yearGroups)
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([year, yearStudents]) => {
          csv += `"=== ${formatYearLevel(year)} (${yearStudents.length}) ==="\r\n`;
          writeStatusGroups(yearStudents);
          csv += `\r\n`;
        });
    } else {
      writeStatusGroups(filteredStudents);
    }

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const safe = (s: string) => s.replace(/[\/\\|*?"<>]/g, '_');
    const filename = `${safe(sessionInfo.title)}_${safe(formatDisplayDate(sessionInfo.date))}(${formatDisplayTime(sessionInfo.startTime)}-${formatDisplayTime(sessionInfo.endTime)})_${safe(courseName)}_${safe(yearLabel.replace(/\s+/g, ''))}_${safe(sessionInfo.departmentName || sessionInfo.departmentAcronym)}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ready) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center text-gray-500">
        Please select Session, Program, and Year Level to view attendance.
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b flex justify-between items-center border-gray-200 px-6 py-5 md:px-8 md:py-6">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-800">
            Members List
          </h2>
          <p className="text-sm text-amber-600 mt-1">
            Present and absent members
          </p>
        </div>
        <div>
          <p className="text-sm md:text-md lg:text-lg text-gray-600 mt-2">
            Total Students:{" "}
            <span className="font-semibold">{students.length}</span>
          </p>
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Loading...
          </div>
        ) : students.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No records found.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-full">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Full Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">
                    Time-In
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Time-Out
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-base font-medium text-gray-900">
                          {s.name}
                        </span>
                        <span className="text-sm text-gray-500 md:hidden">
                          Time-In: {s.timeIn}
                        </span>
                        <span className="text-sm text-gray-500 lg:hidden">
                          Time-Out: {s.timeOut}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell whitespace-nowrap">
                      {s.timeIn}
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell whitespace-nowrap">
                      {s.timeOut}
                    </td>
                    <td className="px-6 py-5">
                      <Status status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer with Button */}
      {students.length > 0 && hasSessionEnded && (
        <div className="px-6 py-4 md:px-8 md:py-5 border-t border-gray-200 shrink-0 flex justify-end bg-white">
          <Button
            type="button"
            text="Download CSV"
            backgroundColor="bg-green-700"
            textColor="text-white"
            onClick={downloadCSV}
          />
        </div>
      )}
    </div>
  );
}
