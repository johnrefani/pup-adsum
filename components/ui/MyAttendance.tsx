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
  isPresent: boolean;
}

const MyAttendance = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm md:text-base lg:text-lg font-semibold text-gray-700">Session</th>
                  <th className="text-left px-6 py-4 text-sm md:text-base lg:text-lg font-semibold text-gray-700">Date</th>
                  <th className="text-left px-6 py-4 text-sm md:text-base lg:text-lg font-semibold text-gray-700">Time-In</th>
                  <th className="text-left px-6 py-4 text-sm md:text-base lg:text-lg font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-5 text-sm md:text-base lg:text-lg text-gray-900 font-medium">
                      {record.session}
                    </td>
                    <td className="px-6 py-5 text-sm md:text-base lg:text-lg text-gray-700">{record.date}</td>
                    <td className="px-6 py-5 text-sm md:text-base lg:text-lg text-gray-700">
                      {record.timeIn === "Not Attended" ? "—" : record.timeIn}
                    </td>
                    <td className="px-6 py-5">
                      <Status isPresent={record.isPresent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {records.map((record) => (
              <div key={record._id} className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg pr-3">{record.session}</h3>
                  <Status isPresent={record.isPresent} />
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{record.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Time In:</span>
                    <span className={record.timeIn === "Not Attended" ? "text-red-600 font-medium" : ""}>
                      {record.timeIn}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendance;