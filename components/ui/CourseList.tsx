"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/lib/imports';
import { Editing, Trash } from '@/lib/icons';
import { CoursePopup, DeletePopup, SuccessPopup } from '@/components/ui/PopupCards';

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
}

interface Department {
  id: string;
  acronym: string;
  name: string;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showCourseSuccess, setShowCourseSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, deptRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/departments'),
      ]);

      if (!coursesRes.ok || !deptRes.ok) throw new Error('Failed to fetch');

      const coursesData = await coursesRes.json();
      const deptData = await deptRes.json();

      setCourses(coursesData.courses || []);
      setDepartments(
        deptData.departments?.map((d: any) => ({
          id: d._id.toString(),
          acronym: d.acronym,
          name: d.name,
        })) || []
      );
    } catch (err) {
      console.error(err);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(
        data.departments?.map((d: any) => ({
          id: d._id.toString(),
          acronym: d.acronym,
          name: d.name,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddPopup = async () => {
    await fetchDepartments();
    setIsAddPopupOpen(true);
  };

  const openEditPopup = async (course: Course) => {
    setSelectedCourse(course);
    await fetchDepartments();
    setIsEditPopupOpen(true);
  };

  const handleSubmitCourse = async (
    acronym: string,
    completeName: string,
    departmentName: string,
    id?: string
  ) => {
    const method = id ? 'PATCH' : 'POST';

    const res = await fetch('/api/courses', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acronym, name: completeName, departmentName }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Operation failed');
    }

    await fetchData();

    // Close form popups
    setIsAddPopupOpen(false);
    setIsEditPopupOpen(false);
    setSelectedCourse(null);

    // Show success message
    setSuccessMessage(
      id
        ? "Program has been updated successfully."
        : "Program has been added successfully."
    );
    setShowCourseSuccess(true);
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      const res = await fetch('/api/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCourse.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }

      await fetchData();
      setIsDeletePopupOpen(false);
      setSelectedCourse(null);
      setShowDeleteSuccess(true);
    } catch (error: any) {
      alert(error.message || 'Failed to delete Program');
    }
  };

  const openDeletePopup = (course: Course) => {
    setSelectedCourse(course);
    setIsDeletePopupOpen(true);
  };

  return (
    <div className="">
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 px-6 py-5 lg:px-8 lg:py-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">
            Program List
          </h2>
          <p className="text-sm text-amber-600 mt-1">Manage programs</p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading programs...</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No program found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                  <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">
                    Program
                  </th>
                  <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Department
                  </th>
                  <th className="text-center px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">
                    Controls
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 md:px-6 md:py-4">
                      <div className="flex flex-col">
                        <span className="text-base font-medium text-gray-900">
                          {course.code}
                        </span>
                        <span className="text-sm text-gray-500">
                          {course.name}
                        </span>
                        <span className="text-xs text-gray-400 lg:hidden mt-1">
                          Dept: {course.department}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 md:px-6 md:py-4 text-gray-700 hidden lg:table-cell">
                      {course.department}
                    </td>
                    <td className="px-4 py-2 md:px-6 md:py-4">
                      <div className="flex items-center justify-center gap-2 lg:gap-4">
                        <Button
                          leftIcon={<Editing className="w-4 h-4" />}
                          backgroundColor="bg-blue-600 hover:bg-blue-700"
                          textColor="text-white"
                          size="sm"
                          onClick={() => openEditPopup(course)}
                        />
                        <Button
                          leftIcon={<Trash className="w-4 h-4" />}
                          backgroundColor="bg-red-600 hover:bg-red-700"
                          textColor="text-white"
                          size="sm"
                          onClick={() => openDeletePopup(course)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex justify-end">
            <Button
              text="Add New Program"
              textColor="text-white"
              backgroundColor="bg-maroon-800 hover:bg-maroon-900"
              onClick={openAddPopup}
            />
          </div>
        </div>
      </div>

      {/* Popups */}
      <CoursePopup
        isOpen={isAddPopupOpen}
        onClose={() => setIsAddPopupOpen(false)}
        department={departments.map((d) => ({
          id: Number(d.id),
          acronym: d.acronym,
          name: d.name,
        }))}
        onSubmit={handleSubmitCourse}
      />

      {selectedCourse && (
        <CoursePopup
          isOpen={isEditPopupOpen}
          onClose={() => {
            setIsEditPopupOpen(false);
            setSelectedCourse(null);
          }}
          department={departments.map((d) => ({
            id: Number(d.id),
            acronym: d.acronym,
            name: d.name,
          }))}
          isEdit={true}
          initialData={{
            id: selectedCourse.id,
            acronym: selectedCourse.code,
            completeName: selectedCourse.name,
            department: selectedCourse.department,
          }}
          onSubmit={handleSubmitCourse}
        />
      )}

      {selectedCourse && (
        <DeletePopup
          isOpen={isDeletePopupOpen}
          onClose={() => {
            setIsDeletePopupOpen(false);
            setSelectedCourse(null);
          }}
          deleteItem={handleDeleteCourse}
          itemName={`${selectedCourse.code} - ${selectedCourse.name}`}
          itemType="Course"
        />
      )}

      <SuccessPopup
        isOpen={showDeleteSuccess}
        onClose={() => setShowDeleteSuccess(false)}
        title="Deleted!"
        message="Program has been deleted successfully."
      />

      <SuccessPopup
        isOpen={showCourseSuccess}
        onClose={() => setShowCourseSuccess(false)}
        title="Success!"
        message={successMessage}
      />
    </div>
  );
};

export default CourseList;