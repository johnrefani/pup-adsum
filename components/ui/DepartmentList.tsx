// File: DepartmentList.tsx
import React from 'react';
import { Button } from '@/lib/imports';
import { Editing, Trash } from '@/lib/icons';

const DepartmentList: React.FC = () => {
  const departments = [
    { id: 1, name: 'COED' },
    { id: 2, name: 'ICS' },
  ];

  return (
    <div className="">
      <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 lg:px-8 lg:py-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">
            Department List
          </h2>
          <p className="text-sm text-amber-600 mt-1">Manage departments</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Departments
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                  Controls
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-5 text-base font-medium text-gray-900">
                    {dept.name}
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

        {/* Add New Department Button */}
       <div className="flex justify-end p-6">
          <Button
            text="Add New Department"
            
            textColor="text-white"
            backgroundColor="bg-maroon-800 hover:bg-maroon-900"
            size="lg"
            
          />
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;