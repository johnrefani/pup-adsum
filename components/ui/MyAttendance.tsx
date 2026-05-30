// components/ui/MyAttendance.tsx
"use client";

import { useState, useEffect } from "react";
import Status from "../atoms/Status";
import { CustomSelect } from "@/lib/imports";
import { Close, Filter } from "@/lib/icons";

type AttendanceStatus =
  | "present"
  | "absent"
  | "unfinished"
  | "late"
  | "timed-in"
  | "timed-in-late"
  | "late-unfinished"
  | null;

interface AttendanceRecord {
  _id: string;
  session: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: AttendanceStatus;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  unfinished: number;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MyAttendance = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();
  const defaultSchoolYear = `${currentYear}-${currentYear + 1}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(defaultSchoolYear);
  const [selectedSemester, setSelectedSemester] = useState("1st Semester");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    unfinished: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const schoolYears = Array.from({ length: currentYear - 2020 + 2 }, (_, index) => {
    const start = currentYear + 1 - index;
    return `${start}-${start + 1}`;
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          month: selectedMonth,
          schoolYear: selectedSchoolYear,
          semester: selectedSemester,
        });

        const res = await fetch(`/api/user/my-attendance?${params}`);

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setRecords(data.records || []);
        setStats(data.stats || { present: 0, absent: 0, late: 0, unfinished: 0 });
      } catch (err) {
        console.error(err);
        setRecords([]);
        setStats({ present: 0, absent: 0, late: 0, unfinished: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedMonth, selectedSchoolYear, selectedSemester]);

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const displayTime = (value: string, emptyLabel: string) =>
    value === emptyLabel ? "-" : value;

  const renderFilterControls = () => (
    <>
      <div className="min-w-0">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Month
        </p>
        <CustomSelect
          value={selectedMonth}
          onChange={(value) => setSelectedMonth(value as string)}
          options={months.map((month) => ({ label: month, value: month }))}
          placeholder="Month"
          className="w-full"
          triggerClassName="min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 shadow-sm"
          contentClassName="min-w-full"
          itemClassName="rounded-sm"
        />
      </div>
      <div className="min-w-0">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          School Year
        </p>
        <CustomSelect
          value={selectedSchoolYear}
          onChange={(value) => setSelectedSchoolYear(value as string)}
          options={schoolYears.map((year) => ({ label: year, value: year }))}
          placeholder="School Year"
          className="w-full"
          triggerClassName="min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 shadow-sm"
          contentClassName="min-w-full"
          itemClassName="rounded-sm"
        />
      </div>
      <div className="min-w-0">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Semester
        </p>
        <CustomSelect
          value={selectedSemester}
          onChange={(value) => setSelectedSemester(value as string)}
          options={[
            { label: "1st Semester", value: "1st Semester" },
            { label: "2nd Semester", value: "2nd Semester" },
          ]}
          placeholder="Semester"
          className="w-full"
          triggerClassName="min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 shadow-sm"
          contentClassName="min-w-full"
          itemClassName="rounded-sm"
        />
      </div>
    </>
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-4 sm:p-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">
            My Attendance Records
          </h1>

          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="inline-flex md:hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-red-800 shadow-sm transition hover:bg-red-50"
            aria-label="Open attendance filters"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden md:block rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 shadow-sm">
          <div className="grid grid-cols-3 gap-3 lg:gap-4">{renderFilterControls()}</div>
        </div>

        <div className="md:hidden rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Active filters
          </p>
          <p className="mt-1 truncate text-sm font-medium text-gray-800">
            {selectedMonth} | {selectedSchoolYear} | {selectedSemester}
          </p>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close attendance filters"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Attendance
                  </p>
                  <h2 className="text-lg font-bold text-red-800">Filters</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                  aria-label="Close attendance filters"
                >
                  <Close className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4">{renderFilterControls()}</div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="mt-5 w-full rounded-lg bg-red-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-gray-600">Present</p>
          <p className="text-2xl font-bold text-green-700">{stats.present}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-gray-600">Absent</p>
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-gray-600">Late</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm text-gray-600">Unfinished Attendance</p>
          <p className="text-2xl font-bold text-orange-700">{stats.unfinished}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading attendance records...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No attendance records found for {selectedMonth} {selectedSchoolYear} {selectedSemester}
        </div>
      ) : (
        <>
          <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[75vh] overflow-y-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="text-left px-4 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700">Session</th>
                    <th className="text-left px-4 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700">Date</th>
                    <th className="text-left pr-2 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700 whitespace-nowrap">Time-In</th>
                    <th className="text-left pr-2 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700 whitespace-nowrap">Time-Out</th>
                    <th className="text-left px-4 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map((record) => (
                    <tr key={record._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-2 lg:px-6 lg:py-4 text-sm md:text-base lg:text-lg text-gray-900 font-medium">
                        {record.session}
                      </td>
                      <td className="px-4 py-2 lg:px-6 lg:py-4 text-sm md:text-base lg:text-lg text-gray-700">
                        {record.date}
                      </td>
                      <td className="px-1 py-2 lg:px-6 lg:py-4 text-sm md:text-base lg:text-lg text-gray-700">
                        {displayTime(record.timeIn, "Not Attended")}
                      </td>
                      <td className="px-1 py-2 lg:px-6 lg:py-4 text-sm md:text-base lg:text-lg text-gray-700">
                        {displayTime(record.timeOut, "Not Timed Out")}
                      </td>
                      <td className="px-4 py-2 lg:px-6 lg:py-4">
                        <Status status={record.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="block md:hidden overflow-x-auto border border-gray-200 rounded-lg">
            <div className="max-h-[75vh] overflow-y-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                      Session
                    </th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-gray-700 w-24">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-sm text-gray-900 font-medium">
                        <div>{record.session}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Time-In: {displayTime(record.timeIn, "Not Attended")}
                        </div>
                        <div className="text-xs text-gray-500">
                          Time-Out: {displayTime(record.timeOut, "Not Timed Out")}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <Status status={record.status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendance;
