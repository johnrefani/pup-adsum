"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/lib/imports';
import { Editing, Trash } from '@/lib/icons';
import { DepartmentPopup, SuccessPopup, DeletePopup } from '@/components/ui/PopupCards';

interface Department {
  _id: string;
  acronym: string;
  name: string;
}

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.departments) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const showSuccess = (title: string, message: string) => {
    setSuccessMessage(message);
    setIsSuccessOpen(true);
  };

  const handleAddDepartment = async (acronym: string, name: string) => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acronym, name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add');
      }

      await fetchDepartments();
      setIsAddOpen(false);
      showSuccess("Department Added!", "The new organization has been successfully added.");
    } catch (error: any) {
      alert(error.message || 'Failed to add organization');
      throw error;
    }
  };

  const handleEditDepartment = async (acronym: string, name: string, id?: number) => {
    if (!selectedDepartment) return;

    try {
      const res = await fetch('/api/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDepartment._id, acronym, name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update');
      }

      await fetchDepartments();
      setIsEditOpen(false);
      showSuccess("Department Updated!", `"${acronym}" has been successfully updated.`);
    } catch (error: any) {
      alert(error.message || 'Failed to update organization');
      throw error;
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      const res = await fetch('/api/departments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDepartment._id }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete');
      }

      await fetchDepartments();
      setIsDeleteOpen(false);
      showSuccess("Department Deleted!", `"${selectedDepartment.acronym}" has been removed.`);
    } catch (error: any) {
      alert(error.message || 'Failed to delete organization');
      throw error;
    }
  };

  const openEdit = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsEditOpen(true);
  };

  const openDelete = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsDeleteOpen(true);
  };

  return (
    <div className="">
      {/* Uniform height card */}
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 lg:px-8 lg:py-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">
            Organization List
          </h2>
          <p className="text-sm text-amber-600 mt-1">Manage organizations</p>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading organizations...</div>
          ) : departments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No Organizations found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Organization
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                    Controls
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5 text-base font-medium text-gray-900">
                      {dept.acronym} - {dept.name}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          leftIcon={<Editing className="w-4 h-4" />}
                          backgroundColor="bg-blue-500"
                          textColor="text-white"
                          size="sm"
                          onClick={() => openEdit(dept)}
                        />
                        <Button
                          leftIcon={<Trash className="w-4 h-4" />}
                          backgroundColor="bg-red-500"
                          textColor="text-white"
                          size="sm"
                          onClick={() => openDelete(dept)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Fixed Add Button Bar */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex justify-end">
            <Button
              text="Add New Organization"
              textColor="text-white"
              backgroundColor="bg-maroon-800 hover:bg-maroon-900"
              onClick={() => setIsAddOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Popups */}
      <DepartmentPopup
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddDepartment}
      />

      {selectedDepartment && (
        <DepartmentPopup
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedDepartment(null);
          }}
          isEdit={true}
          initialData={{
            id: selectedDepartment._id as any,
            acronym: selectedDepartment.acronym,
            name: selectedDepartment.name,
          }}
          onSubmit={handleEditDepartment}
        />
      )}

      {selectedDepartment && (
        <DeletePopup
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedDepartment(null);
          }}
          deleteItem={handleDeleteDepartment}
          itemName={`${selectedDepartment.acronym} - ${selectedDepartment.name}`}
          itemType="Department"
        />
      )}

      <SuccessPopup
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Success!"
        message={successMessage}
      />
    </div>
  );
};

export default DepartmentList;