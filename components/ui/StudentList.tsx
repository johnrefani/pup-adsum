
import { Status } from '@/lib/imports';
import React from 'react';


const StudentList: React.FC = () => {
  // Pure front-end dummy data
  const students = [
    { id: 1, name: 'John Doe', timeIn: '1:00PM', isPresent: true },
    { id: 2, name: 'Harry Potter', timeIn: '1:00PM', isPresent: true },
    { id: 3, name: 'Ariana Grande', timeIn: '1:00PM', isPresent: true },
    { id: 4, name: 'Katy Perry', timeIn: '---', isPresent: false },
    { id: 5, name: 'Michael Jackson', timeIn: '1:00PM', isPresent: true },
    { id: 6, name: 'Emma Watson', timeIn: '1:00PM', isPresent: true },
    { id: 7, name: 'Sheila Lala', timeIn: '---', isPresent: false },
    { id: 8, name: 'John Rey Lee', timeIn: '1:00PM', isPresent: true },
    { id: 9, name: 'John Cloyd Villar', timeIn: '1:00PM', isPresent: true },
    { id: 10, name: 'Henry Uy', timeIn: '---', isPresent: false },
    { id: 11, name: 'Mario Del Pilar', timeIn: '1:00PM', isPresent: true },
  ];

  return (
    <div className="">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 md:px-8 md:py-6">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-800">
            Students List
          </h2>
          <p className="text-sm text-amber-600 mt-1">
            List of present and absent students.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Full Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">
                  Time-In
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition"
                >
                  {/* Full Name + Mobile Time-In */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900">
                        {student.name}
                      </span>
                      <span className="text-sm text-gray-500 md:hidden">
                        Time-In: {student.timeIn}
                      </span>
                    </div>
                  </td>

                  {/* Time-In - Hidden on mobile */}
                  <td className="px-6 py-5 text-gray-700 font-medium hidden md:table-cell">
                    {student.timeIn}
                  </td>

                  {/* Status using your custom component */}
                  <td className="px-6 py-5">
                    <Status isPresent={student.isPresent} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;