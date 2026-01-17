"use client";
import React, { useEffect, useState } from 'react';
import { Button, Status } from '@/lib/imports';

type Student = {
  _id: string;
  name: string;
  idNumber: string;
  timeIn: string;
  status: 'present' | 'absent' | null;
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

  useEffect(() => {
    if (!ready) {
      setStudents([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ sessionId, courseId, yearLevel, search });
    fetch(`/api/admin/attendance-records?${params}`)
      .then(r => r.json())
      .then(d => setStudents(d.students || []))
      .finally(() => setLoading(false));
  }, [sessionId, courseId, yearLevel, search, ready]);

  const downloadCSV = () => {
    if (!sessionInfo || students.length === 0) return;

    const headers = ['ID Number', 'Full Name', 'Time-In', 'Status'];
    const rows = students.map(s => [
      s.idNumber,
      s.name,
      s.timeIn,
      s.status === null ? '--' : s.status === 'present' ? 'Present' : 'Absent',
    ]);

    let csv = headers.join(',') + '\r\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\r\n';
    });

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const safe = (s: string) => s.replace(/[\/\\|*?"<>]/g, '_');
    const filename = `${safe(sessionInfo.title)}_${sessionInfo.date}(${sessionInfo.startTime}-${sessionInfo.endTime})_${safe(courseName)}_${yearLevel}th_${sessionInfo.departmentAcronym}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ready) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center text-gray-500">
        Please select Session, Course, and Year Level to view attendance.
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-5 md:px-8 md:py-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-800">Members List</h2>
          <p className="text-sm text-amber-600 mt-1">Present and absent members</p>
        </div>
        {students.length > 0 && (          
          <Button
              type="button"
              text="Download CSV"
              backgroundColor="bg-green-700"
              textColor="text-white"
              onClick={downloadCSV}
          />
        )}
      </div>
      

      {loading ? (
        <div className="p-10 text-center">Loading...</div>
      ) : students.length === 0 ? (
        <div className="p-10 text-center text-gray-500">No records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Full Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">Time-In</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map(s => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900">{s.name}</span>
                      <span className="text-sm text-gray-500 md:hidden">Time-In: {s.timeIn}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden md:table-cell">{s.timeIn}</td>
                  <td className="px-6 py-5">
                    {s.status === null ? (
                      <span className="text-gray-400 font-medium">--</span>
                    ) : (
                      <Status isPresent={s.status === 'present'} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}