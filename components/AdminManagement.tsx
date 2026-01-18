"use client";

import { useEffect, useState } from "react";
import {
  AdminList,
  CourseList,
  DepartmentList,
  Button,
  SuccessPopup,
  UpdateMyAccount,
} from "@/lib/imports";

const AdminManagement = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  const fetchMyAccount = async () => {
    const res = await fetch("/api/admins/main");
    if (!res.ok) throw new Error("Failed to load account");
    const data = await res.json();
    setInitialData({
      id: data.id,
      fullname: data.fullName,
      username: data.username,
    });
  };

  const handleOpen = async () => {
    await fetchMyAccount();
    setOpenUpdate(true);
  };

  const handleSubmit = async (
    fullname: string,
    username: string,
    password: string
  ) => {
    const res = await fetch("/api/admins/main", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: fullname, username, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Update failed");
    }

    setOpenUpdate(false);
    setSuccess(true);
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-6 overflow-hidden">
      <div className="grid grid-cols-1 lg:flex lg:justify-between lg:items-end space-y-4 md:space-y-6 lg:space-y-0">
        <div>
          <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">
            Admin Management
          </h1>
          <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">
            Manage Admin Accounts, Departments, and Courses.
          </p>
        </div>


        <div className="place-self-end">
          <Button
          text="Update my Account"
          backgroundColor="bg-white border border-maroon-800"
          textColor="text-maroon-800"
          onClick={handleOpen}
        />
        </div>
        
      </div>

      <div className="flex flex-col gap-6">
        <AdminList />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CourseList />
          <DepartmentList />
        </div>
      </div>

      <UpdateMyAccount
        isOpen={openUpdate}
        onClose={() => setOpenUpdate(false)}
        initialData={initialData}
        onSubmit={handleSubmit}
      />

      <SuccessPopup
        isOpen={success}
        onClose={() => setSuccess(false)}
        title="Account Updated Successfully!"
        message="Your admin account information has been updated."
      />
    </section>
  );
};

export default AdminManagement;
