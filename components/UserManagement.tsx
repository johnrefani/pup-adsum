"use client";
import { useState } from "react";
import {
  UserFilter,
} from "@/lib/imports";
import StudentData from '@/components/ui/StudentData';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<"member" | "admin">("member");
  const [filters, setFilters] = useState({
    course: "",
    year: "",
    name: "",
  });

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8 overflow-hidden">
      <div className="grid grid-cols-1 lg:flex lg:justify-between lg:items-end space-y-4 md:space-y-6 lg:space-y-0">
        <div>
          <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">
            Member Management
          </h1>
          <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">
            Manage Accounts members.
          </p>
        </div>
      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <UserFilter onFilterChange={setFilters} />
            <StudentData
              selectedCourse={filters.course}
              selectedYear={filters.year}
              searchName={filters.name}
            /> 
          </div>
    </section>
  );
};

export default UserManagement;