"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/lib/imports';
import { Editing, Trash } from '@/lib/icons';
import { ManageMember, DeletePopup, SuccessPopup } from './PopupCards';

interface Student {
  id: string;
  fullName: string;
  idNumber: string;
  username: string;
  course: string;
  courseId: string;
  yearLevel: string;
}

interface StudentDataProps {
  selectedCourse: string;
  selectedYear: string;
  searchName: string;
}

const StudentData: React.FC<StudentDataProps> = ({
  selectedCourse,
  selectedYear,
  searchName,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse || !selectedYear) {
        setStudents([]);
        return;
      }

      setLoading(true);
      const params = new URLSearchParams();
      params.append('course', selectedCourse);
      params.append('year', selectedYear);
      if (searchName.trim()) params.append('name', searchName);

      try {
        const res = await fetch(`/api/members?${params}`);
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCourse, selectedYear, searchName, refreshKey]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setEditOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setDeletingStudent(student);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;

    try {
      const res = await fetch('/api/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingStudent.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Delete failed');
      }

      setDeleteOpen(false);
      setSuccessOpen(true);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert('Failed to delete member');
    }
  };

  const handleSuccess = () => {
    setEditOpen(false);
    setSuccessOpen(true);
    setRefreshKey(k => k + 1);
  };

  const hasFilters = selectedCourse && selectedYear;

  return (
    <div>
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-800">
            Members List
          </h2>
          <p className="text-sm text-amber-600 mt-1">
            {hasFilters
              ? `${students.length} member${students.length !== 1 ? 's' : ''} found`
              : 'Select Course and Year Level to view members'}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-500">Loading students...</div>
        )}

        {/* Empty State */}
        {!loading && hasFilters && students.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No students found matching your criteria.
          </div>
        )}

        {/* Table */}
        {!loading && hasFilters && students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Full Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">ID Number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">Course</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Year Level</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-base font-medium text-gray-900">{student.fullName}</span>
                        <span className="text-sm text-gray-500 sm:hidden">{student.idNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-700 font-medium hidden sm:table-cell">
                      {student.idNumber}
                    </td>
                    <td className="px-6 py-5 text-gray-700 hidden md:table-cell">
                      {student.course}
                    </td>
                    <td className="px-6 py-5 text-gray-700 hidden lg:table-cell">
                      {student.yearLevel}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        {/* Edit Button */}
                        <Button
                          leftIcon={<Editing className="w-4 h-4" />}
                          backgroundColor="bg-blue-500 hover:bg-blue-600"
                          textColor="text-white"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        />

                        {/* Delete Button */}
                        <Button
                          leftIcon={<Trash className="w-4 h-4" />}
                          backgroundColor="bg-red-500 hover:bg-red-600"
                          textColor="text-white"
                          size="sm"
                          onClick={() => handleDeleteClick(student)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === POPUPS === */}

      {/* Edit Member Popup */}
      <ManageMember
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        student={editingStudent}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Popup */}
      <DeletePopup
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        deleteItem={handleDelete}
        itemName={deletingStudent?.fullName || ''}
        itemType="Member"
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Success!"
        message={`Member has been ${deletingStudent ? 'deleted' : 'updated'} successfully.`}
      />
    </div>
  );
};

export default StudentData;