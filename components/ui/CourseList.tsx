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
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false); // NEW
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

  useEffect(() => {
    fetchData();
  }, []);

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
      alert(error.message || 'Failed to delete course');
    }
  };

  const openEditPopup = (course: Course) => {
    setSelectedCourse(course);
    setIsEditPopupOpen(true);
  };

  const openDeletePopup = (course: Course) => {
    setSelectedCourse(course);
    setIsDeletePopupOpen(true);
  };

  return (
    <div className="">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 lg:px-8 lg:py-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">
            Courses List
          </h2>
          <p className="text-sm text-amber-600 mt-1">Manage courses</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-8 text-center text-gray-500">Loading courses...</div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">
                    Courses
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
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No courses found
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 md:px-6 md:py-4">
                        <div className="flex flex-col">
                          <span className="text-base font-medium text-gray-900">
                            {course.code}
                          </span>
                          <span className="text-sm text-gray-500 md:flex hidden">
                            {course.name}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end p-6">
          <Button
            text="Add New Course"
            textColor="text-white"
            backgroundColor="bg-maroon-800 hover:bg-maroon-900"
            onClick={() => setIsAddPopupOpen(true)}
          />
        </div>
      </div>

      {/* Add Popup */}
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

      {/* Edit Popup */}
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

      {/* Delete Confirmation Popup */}
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

      {/* Success Popup after Delete */}
      <SuccessPopup
        isOpen={showDeleteSuccess}
        onClose={() => setShowDeleteSuccess(false)}
        title="Deleted!"
        message="Course has been deleted successfully."
      />
    </div>
  );
};

export default CourseList;