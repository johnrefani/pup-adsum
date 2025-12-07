// components/attendance/Attendance.tsx
"use client";

import { useState } from "react";
import Status from "../atoms/Status";
import MonthFilter from "../atoms/MonthFilter";

interface AttendanceRecord {
  session: string;
  date: string;
  timeIn: string;
  isPresent: boolean;
}

const mockData: AttendanceRecord[] = [
  { session: "Project Meeting", date: "November 1, 2025", timeIn: "8:00 AM", isPresent: true },
  { session: "AM Check in", date: "November 1, 2025", timeIn: "Not Attended", isPresent: false },
  { session: "PM Check in", date: "November 1, 2025", timeIn: "12:00 PM", isPresent: true },
  { session: "General Assembly 1", date: "November 3, 2025", timeIn: "8:00 AM", isPresent: true },
];

const MyAttendance = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const filteredData = mockData.filter((record) =>
    record.date.includes(selectedMonth) && record.date.includes(selectedYear.toString())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-800">
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

        {/* Desktop: Table View */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Session</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Time-In</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    No records found for {selectedMonth} {selectedYear}
                  </td>
                </tr>
              ) : (
                filteredData.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-5 text-sm text-gray-900 font-medium">{record.session}</td>
                    <td className="px-6 py-5 text-sm text-gray-700">{record.date}</td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {record.timeIn === "Not Attended" ? "—" : record.timeIn}
                    </td>
                    <td className="px-6 py-5">
                      <Status isPresent={record.isPresent} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet: Card View */}
        <div className="block md:hidden space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow text-gray-500">
              No records found for {selectedMonth} {selectedYear}
            </div>
          ) : (
            filteredData.map((record, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{record.session}</h3>
                  <Status isPresent={record.isPresent} />
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{record.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Time In:</span>
                    <span className={record.timeIn === "Not Attended" ? "text-red-600" : ""}>
                      {record.timeIn === "Not Attended" ? "Not Attended" : record.timeIn}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;