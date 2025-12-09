"use client";
import React, { useState, useEffect } from 'react';
import { InputField, Button, SearchableSelectField, ManageMember, SuccessPopup } from '@/lib/imports';
import { Filter } from '@/lib/icons';

const UserFilter: React.FC<{ onFilterChange: (filters: any) => void }> = ({ onFilterChange }) => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchName, setSearchName] = useState("");
  const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

  useEffect(() => {
    fetch('/api/admin/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []));
  }, []);

  useEffect(() => {
    onFilterChange({
      course: selectedCourse,
      year: selectedYear,
      name: searchName,
    });
  }, [selectedCourse, selectedYear, searchName, onFilterChange]);

  const handleAddSuccess = () => {
    setIsAddOpen(false);
    setIsSuccessOpen(true);
    onFilterChange({
      course: selectedCourse,
      year: selectedYear,
      name: searchName,
    });
  };

  return (
    <div className="">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6 flex items-center gap-3 text-lg md:text-xl lg:text-2xl">
          <Filter />
          <h2 className="font-bold text-gray-800">Filters</h2>
        </div>
        <div className="p-6 sm:p-8 lg:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Course
              </label>
              <SearchableSelectField
                placeholder="Select course..."
                options={courses}
                value={selectedCourse}
                onChange={setSelectedCourse}
              />
            </div>
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Search by Name {selectedCourse && selectedYear ? '' : '(Select course & year first)'}
            </label>
            <InputField
              placeholder={
                selectedCourse && selectedYear
                  ? "Type name to search..."
                  : "Course & Year required first"
              }
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              state={selectedCourse && selectedYear ? "editable" : "disabled"}
              disabled={!selectedCourse || !selectedYear}
            />
          </div>
          <div className="flex justify-end pt-6">
            <Button
              text="Add new member"
              textColor="text-white"
              backgroundColor="bg-red-900 hover:bg-red-500"
              onClick={() => setIsAddOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Add Member Popup */}
      <ManageMember
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Member Added"
        message="The new member has been successfully added."
      />
    </div>
  );
};

export default UserFilter;