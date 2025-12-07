// File: CourseList.tsx
import React from 'react';
import { Button } from '@/lib/imports';
import { Editing, Trash } from '@/lib/icons';

const CourseList: React.FC = () => {
  const courses = [
    { id: 1, code: 'BEED', department: 'COED' },
    { id: 2, code: 'BSED-M', department: 'COED' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl sm:text-2xl font-bold text-red-800">
            Courses List
          </h2>
          <p className="text-sm text-amber-600 mt-1">Manage courses</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Courses
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                  Department
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                  Controls
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900">
                        {course.code}
                      </span>
                      <span className="text-sm text-gray-500 sm:hidden">
                        {course.department}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-700 hidden sm:table-cell">
                    {course.department}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        leftIcon={<Editing className="w-4 h-4" />}
                        backgroundColor="bg-blue-500"
                        textColor="text-white"
                        size="sm"
                      />
                      <Button
                        leftIcon={<Trash className="w-4 h-4" />}
                        backgroundColor="bg-red-500"
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

        {/* Add New Course Button */}
        <div className="flex justify-end pt-6">
          <Button
            text="Add New Course"
            
            textColor="text-white"
            backgroundColor="bg-maroon-800 hover:bg-maroon-900"
            size="lg"
           
          />
        </div>
      </div>
    </div>
  );
};

export default CourseList;