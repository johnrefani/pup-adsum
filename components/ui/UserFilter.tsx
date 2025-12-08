"use client";

import React, { useState } from 'react';
import { InputField, Button } from '@/lib/imports';
import { SearchableSelectField } from '@/lib/imports';
import { Filter } from '@/lib/icons';

const UserFilter: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchName, setSearchName] = useState("");

  const courses = ["BEED", "BSED", "BSIT", "BSCRIM", "BSHM"] as const;
  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

  return (
    <div className="">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6 flex items-center gap-3 text-lg md:text-xl lg:text-2xl">
          <Filter />
          <h2 className="font-bold text-gray-800">Filters</h2>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Course & Year Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Course
              </label>
              <SearchableSelectField
                placeholder="Select course..."
                options={courses.map((c) => ({ value: c, label: c }))}
                value={selectedCourse}
                onChange={setSelectedCourse}
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Year
              </label>
              <SearchableSelectField
                placeholder="Select year..."
                options={yearLevels.map((y) => ({ value: y, label: y }))}
                value={selectedYear}
                onChange={setSelectedYear}
              />
            </div>
          </div>

          {/* Search by Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Search
            </label>
            <InputField
              placeholder="Search by name..."
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              state="editable"
            />
          </div>

          {/* Add new member Button */}
          <div className="flex justify-end pt-6">
            <Button
              text="Add new member"
              textColor="text-white"
              backgroundColor="bg-red-900 hover:bg-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilter;