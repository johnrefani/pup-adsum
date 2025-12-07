
import React from 'react';
import { Button } from '@/lib/imports';
import { Editing, Trash } from '@/lib/icons';


const AdminList: React.FC = () => {
  // Pure front-end dummy data
  const admins = [
    { id: 1, fullName: 'Admin1', username: 'admin1', password: 'admin123', department: 'CSS' },
    { id: 2, fullName: 'Admin2', username: 'admin2', password: 'admin456', department: 'COENG' },
    { id: 3, fullName: 'Admin3', username: 'admin3', password: 'admin789', department: 'COED' },
  ];

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 lg:px-8 lg:py-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">
            Admin List
          </h2>
          <p className="text-sm text-amber-600 mt-1">
            Manage admin accounts
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">
                  Full Name
                </th>
                <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">
                  Username
                </th>
                <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                  Password
                </th>
                <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                  Department
                </th>
                <th className="text-center px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">
                  Controls
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-gray-50 transition"
                >
                  {/* Full Name + Mobile Details */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900">
                        {admin.fullName}
                      </span>
                      <div className="text-sm text-gray-500 md:hidden space-y-1 mt-1">
                        <div>
                          <span className="font-medium">Username:</span> {admin.username}
                        </div>
                        <div className='flex'>
                          <span className="font-medium">Password:</span> {admin.password}
                        </div>
                        <div className="hidden md:flex">
                          <span className="font-medium">Dept:</span> {admin.department}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Username - Hidden on mobile */}
                  <td className=" px-4 py-2 md:px-6 md:py-4 text-gray-700 hidden md:table-cell">
                    {admin.username}
                  </td>

                  {/* Password - Hidden on < lg */}
                  <td className=" px-4 py-2 md:px-6 md:py-4 text-gray-700 hidden md:table-cell">
                    {admin.password}
                  </td>

                  {/* Department - Hidden on < sm */}
                  <td className=" px-4 py-2 md:px-6 md:py-4 text-gray-700 font-medium hidden lg:table-cell">
                    {admin.department}
                  </td>

                  {/* Action Buttons */}
                  <td className=" px-4 py-2 md:px-6 md:py-4">
                    <div className="flex items-center justify-center gap-1 lg:gap-3">
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

        {/* Add New Admin Button */}
        <div className="flex justify-end p-6">
          <Button
            text="Add New Admin"
            textColor="text-white"
            backgroundColor="bg-maroon-800 hover:bg-maroon-900"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminList;