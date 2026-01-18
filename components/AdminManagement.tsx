"use client";
import { useState } from "react";
import {
  AdminList, CourseList, DepartmentList,
} from "@/lib/imports";

const AdminManagement = () => {

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8 overflow-hidden">
      <div className="grid grid-cols-1 lg:flex lg:justify-between lg:items-end space-y-4 md:space-y-6 lg:space-y-0">
        <div>
          <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">
            Admin Management
          </h1>
          <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">
            Manage Admin Accounts, Departments, and Courses.
          </p>
        </div>
      </div>

          <div className="flex flex-col md:grid-rows-2 gap-4 md:gap-6 lg:gap-8">
            <AdminList />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              <CourseList />
              <DepartmentList />
            </div>
          </div>
    </section>
  );
};

export default AdminManagement;