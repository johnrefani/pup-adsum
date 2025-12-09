"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/lib/imports';
import { Editing, Trash } from '@/lib/icons';
import { ManageAdmin, DeletePopup } from '@/components/ui/PopupCards';
import toast from 'react-hot-toast';

interface Admin {
  id: string;
  fullName: string;
  username: string;
  password: string;
  department: string;
}

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [departments, setDepartments] = useState<Array<{ id: number; acronym: string; name: string }>>([]);

  useEffect(() => {
    const fetchDepts = async () => {
      const res = await fetch('/api/departments');
      const data = await res.json();
      setDepartments(data.departments || []);
    };
    fetchDepts();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (
    fullname: string,
    username: string,
    password: string,
    departmentName: string
  ) => {
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: fullname, username, password, departmentName }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add admin');
    toast.success('Admin added successfully');
    setPopupOpen(false);
    fetchAdmins();
  };

  const handleUpdateAdmin = async (
    fullname: string,
    username: string,
    password: string,
    departmentName: string,
    id?: string
  ) => {
    if (!id || !selectedAdmin) return;

    const res = await fetch('/api/admins', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        fullName: fullname,
        username,
        password: password || undefined,
        departmentName,
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update admin');

    toast.success('Admin updated successfully');
    setPopupOpen(false);
    setSelectedAdmin(null);
    fetchAdmins();
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    const res = await fetch(`/api/admins?id=${selectedAdmin.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete admin');

    toast.success('Admin deleted successfully');
    setDeletePopupOpen(false);
    setSelectedAdmin(null);
    fetchAdmins();
  };

  const openEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setPopupOpen(true);
  };

  const openDelete = (admin: Admin) => {
    setSelectedAdmin(admin);
    setDeletePopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setSelectedAdmin(null);
  };

  return (
    <div className="">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 lg:px-8 lg:py-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800">Admin List</h2>
          <p className="text-sm text-amber-600 mt-1">Manage admin accounts</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading admins...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">Full Name</th>
                  <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">Username</th>
                  <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">Password</th>
                  <th className="text-left px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Department</th>
                  <th className="text-center px-4 py-2 md:px-6 md:py-4 text-sm font-semibold text-gray-700">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No admins found</td></tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-base font-medium text-gray-900">{admin.fullName}</span>
                          <div className="text-sm text-gray-500 md:hidden space-y-1 mt-1">
                            <div><span className="font-medium">Username:</span> {admin.username}</div>
                            <div><span className="font-medium">Password:</span> {admin.password}</div>
                            <div><span className="font-medium">Dept:</span> {admin.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 md:px-6 md:py-4 text-gray-700 hidden md:table-cell">{admin.username}</td>
                      <td className="px-4 py-2 md:px-6 md:py-4 text-gray-700 hidden md:table-cell">{admin.password}</td>
                      <td className="px-4 py-2 md:px-6 md:py-4 text-gray-700 font-medium hidden lg:table-cell">{admin.department}</td>
                      <td className="px-4 py-2 md:px-6 md:py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            leftIcon={<Editing className="w-4 h-4" />}
                            backgroundColor="bg-blue-500 hover:bg-blue-600"
                            textColor="text-white"
                            size="sm"
                            onClick={() => openEdit(admin)}
                          />
                          <Button
                            leftIcon={<Trash className="w-4 h-4" />}
                            backgroundColor="bg-red-500 hover:bg-red-600"
                            textColor="text-white"
                            size="sm"
                            onClick={() => openDelete(admin)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end p-6">
          <Button
            text="Add New Admin"
            textColor="text-white"
            backgroundColor="bg-maroon-800 hover:bg-maroon-900"
            onClick={() => {
              setSelectedAdmin(null);
              setPopupOpen(true);
            }}
          />
        </div>
      </div>

      <ManageAdmin
        isOpen={popupOpen}
        onClose={closePopup}
        departments={departments}
        isEdit={!!selectedAdmin}
        initialData={selectedAdmin ? {
          id: selectedAdmin.id,
          fullname: selectedAdmin.fullName,
          username: selectedAdmin.username,
          password: "",
          departmentName: selectedAdmin.department,
        } : undefined}
        onSubmit={selectedAdmin ? handleUpdateAdmin : handleAddAdmin}
      />

      <DeletePopup
        isOpen={deletePopupOpen}
        onClose={() => {
          setDeletePopupOpen(false);
          setSelectedAdmin(null);
        }}
        deleteItem={handleDeleteAdmin}
        itemName={selectedAdmin?.fullName || ''}
        itemType="Admin"
      />
    </div>
  );
};

export default AdminList;