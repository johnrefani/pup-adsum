// components/ui/MyAttendance.tsx
"use client";

import { useState, useEffect } from "react";
import Status from "../atoms/Status";
import { MonthFilter } from '@/lib/imports';

interface AttendanceRecord {
  _id: string;
  session: string;
  date: string;
  timeIn: string;
  status: "present" | "absent" | null;
}

const MyAttendance = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const Statuses = ({ status }: { status: "present" | "absent" | null }) => {
  if (status === null) {
    return <Status status={null} />;
  }

  return status === "present" ? (
    <Status status="present" />
  ) : (
    <Status status="absent" />
  );
};


  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/user/my-attendance?month=${encodeURIComponent(selectedMonth)}&year=${selectedYear}`
        );

        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setRecords(data.records || []);
      } catch (err) {
        console.error(err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">
          My Records for the Month
        </h1>
        <MonthFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChange={(month, year) => {
            setSelectedMonth(month);
            setSelectedYear(year);
          }}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading attendance records...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No attendance records found for {selectedMonth} {selectedYear}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-[75vh] overflow-y-auto"> {/* scrollbar lives here */}
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="text-left px-4 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700">Session</th>
                  <th className="text-left px-4 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700">Date</th>
                  <th className="text-left pr-2 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700 whitespace-nowrap">Time-In</th>
                  <th className="text-left px-4 py-2 lg:px-6 lg:py-4 text-base lg:text-lg font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...records]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((record) => (
                    <tr key={record._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-2 lg:px-6 lg:py-4 text-sm md:text-base lg:text-lg text-gray-900 font-medium">
                        {record.session}
                      </td>
                      <td className="px-4 py-2 lg:px-6 lg:py-4 text-sm md:text-base lg:text-lg text-gray-700">
                        {record.date}
                      </td>
                      <td className="px-1 py-2 lg:px-6 lg:py-4 text-sm md:text-base lg:text-lg text-gray-700">
                        {record.timeIn === "Not Attended" ? "—" : record.timeIn}
                      </td>
                      <td className="px-4 py-2 lg:px-6 lg:py-4">
                        <Statuses status={record.status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          </div>

          {/* Mobile Compact Table */}
          <div className="block md:hidden">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading attendance records...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No attendance records found for {selectedMonth} {selectedYear}
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <div className="max-h-[75vh] overflow-y-auto"> {/* ← adjust height */}
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
                    {records.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4 text-sm text-gray-900 font-medium">
                          {record.session}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <Statuses status={record.status} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendance;