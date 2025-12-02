// File: StudentData.tsx
import React from 'react';
import { Button } from '@/lib/imports';
import { Editing, Trash } from '@/lib/icons';

const StudentData: React.FC = () => {
  // Pure front-end dummy data
  const students = [
    { id: 1, name: 'John Doe', idNumber: 'ID1234' },
    { id: 2, name: 'Harry Potter', idNumber: 'ID1231' },
    { id: 3, name: 'Ariana Grande', idNumber: 'ID1232' },
    { id: 4, name: 'Katy Perry', idNumber: 'ID1233' },
    { id: 5, name: 'Michael Jackson', idNumber: 'ID1235' },
    { id: 6, name: 'Emma Watson', idNumber: 'ID1236' },
    { id: 7, name: 'Sheila Lala', idNumber: 'ID1237' },
    { id: 8, name: 'John Rey Lee', idNumber: 'ID1238' },
    { id: 9, name: 'John Cloyd Villar', idNumber: 'ID1239' },
    { id: 10, name: 'Henry Uy', idNumber: 'ID1230' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-800">
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                  ID Number
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                  Controls
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
                  {/* Full Name + Mobile ID */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900">
                        {student.name}
                      </span>
                      <span className="text-sm text-gray-500 sm:hidden">
                        {student.idNumber}
                      </span>
                    </div>
                  </td>

                  {/* ID Number - Hidden on mobile */}
                  <td className="px-6 py-5 text-gray-700 font-medium hidden sm:table-cell">
                    {student.idNumber}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-3">
                      {/* Edit Button */}
                      <Button
                        leftIcon={<Editing className="w-4 h-4" />}
                        backgroundColor="bg-blue-500 hover:bg-blue-600"
                        textColor="text-white"
                        size="sm"
                      />

                      {/* Delete Button */}
                      <Button
                        leftIcon={<Trash className="w-4 h-4" />}
                        backgroundColor="bg-red-500 hover:bg-red-600"
                        textColor="text-white"
                        size="sm"
                      />
                    </div>
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

export default StudentData;