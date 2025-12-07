// File: AdminManagement.tsx
import React from 'react';
import DepartmentList from '@/components/ui/DepartmentList'
import CourseList from '@/components/ui/CourseList'
import AdminList from '@/components/ui/AdminList'

const AdminManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">

        {/* Admin List — Full width at the top */}
        <div>
          <AdminList />
        </div>

        {/* Equal Height Row: CourseList & DepartmentList */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Container that forces both children to stretch equally */}
          <div className="flex flex-col order-2 xl:order-1">
            <div className="flex-1 min-h-0">
              <CourseList />
            </div>
          </div>

          {/* DepartmentList — Hidden on <lg, shown on lg+ */}
          <div className="hidden lg:flex lg:flex-col order-1 xl:order-2">
            <div className="flex-1 min-h-0">
              <DepartmentList />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminManagement;