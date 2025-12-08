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
    <div className="">
      <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 lg:px-8 lg:py-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">
            Courses List
          </h2>
          <p className="text-sm text-amber-600 mt-1">Manage courses</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left  px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">
                  Courses
                </th>
                <th className="text-left  px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                  Department
                </th>
                <th className="text-center  px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">
                  Controls
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition">
                  <td className=" px-4 py-2 md:px-6 md:py-4">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900">
                        {course.code}
                      </span>
                      <span className="text-sm text-gray-500 md:flex hidden">
                        {course.department}
                      </span>
                    </div>
                  </td>
                  <td className=" px-4 py-2 md:px-6 md:py-4 text-gray-700 hidden sm:table-cell">
                    {course.department}
                  </td>
                  <td className=" px-4 py-2 md:px-6 md:py-4">
                    <div className="flex items-center justify-center gap-1 lg:gap-3">
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
        <div className="flex justify-end p-6">
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