"use client";
import React, { useEffect, useState } from "react";
import { Button, Status } from "@/lib/imports";

type Student = {
  _id: string;
  name: string;
  idNumber: string;
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

    const headers = ["ID Number", "Full Name", "Time-In", "Time-Out", "Status"];
    const rows = students.map((s) => [
      s.idNumber,
      s.name,
      s.timeIn,
      s.timeOut,
      s.status === null ? "--" : s.status,
    ]);

    let csv = headers.join(",") + "\r\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\r\n";
    });

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const safe = (s: string) => s.replace(/[\/\\|*?"<>]/g, "_");
    const filename = `${safe(sessionInfo.title)}_${sessionInfo.date}(${sessionInfo.startTime}-${sessionInfo.endTime})_${safe(courseName)}_${yearLevel}th_${sessionInfo.departmentAcronym}.csv`;

    const a = document.createElement("a");
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
      {students.length > 0 && (
        <div className="px-6 py-4 md:px-8 md:py-5 border-t border-gray-200 flex-shrink-0 flex justify-end bg-white">
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
