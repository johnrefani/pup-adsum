"use client";

import { CourseList, DepartmentList } from "@/lib/imports";

const CoursesProgramsManagement = () => {
  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-6 overflow-hidden">
      <div>
        <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">
          Courses & Programs
        </h1>
        <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">
          Manage organizations and filter programs.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CourseList />
        <DepartmentList />
      </div>
    </section>
  );
};

export default CoursesProgramsManagement;
