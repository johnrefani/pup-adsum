// components/MyProfile.tsx
"use client";

import React, { useState, useRef } from "react";
import { Button, InputField } from "@/lib/imports";
import { Camera } from "@/lib/icons";

interface ProfileData {
  fullName: string;
  schoolId: string;
  username: string;
  course: string;
  yearLevel: string;
  department: string;
  photo: string | null;
}

const initialData: ProfileData = {
  fullName: "Juan Dela Cruz",
  schoolId: "20-2025",
  username: "juandc",
  course: "BSED",
  yearLevel: "2nd Year",
  department: "BSED",
  photo: null,
};

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(initialData);

  // Separate state for password fields when editing
  const [currentPassword] = useState("••••••••••••"); // Just for display
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Add real validation later if needed
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Profile updated successfully!");
    setIsEditing(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleCancel = () => {
    setFormData(initialData);
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-6">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-800 mb-8 text-center md:text-left">
        {isEditing ? "Edit Profile" : "My Profile"}
      </h1>

      <div className="p-6 md:p-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Profile Photo */}
          <div className="w-full lg:w-80 flex flex-col items-center">
            <div
              onClick={handlePhotoClick}
              className={`relative w-52 h-52 md:w-64 md:h-64 rounded-2xl border-4 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden transition-all ${
                isEditing ? "hover:border-yellow-500 hover:shadow-lg cursor-pointer" : ""
              }`}
            >
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-20 h-20 text-gray-400" />
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition rounded-2xl">
                  <Camera className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {isEditing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  text="UPLOAD PHOTO"
                  backgroundColor="bg-yellow-500 hover:bg-white hover:border-yellow-500 border-2 border-yellow-500"
                  textColor="text-white hover:text-yellow-500 font-semibold w-full mt-4"
                  onClick={handlePhotoClick}
                />
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputField
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                state={isEditing ? "editable" : "readonly"}
                placeholder="Enter full name"
              />

              <InputField
                label="School ID"
                value={formData.schoolId}
                state="disabled"
              />

              <InputField
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                state={isEditing ? "editable" : "readonly"}
                placeholder="Enter username"
              />

              <InputField
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                state={isEditing ? "editable" : "readonly"}
                placeholder="e.g. BSED"
              />

              <InputField label="Course" value={formData.course} state="readonly" />

              <InputField label="Year Level" value={formData.yearLevel} state="readonly" />

              {/* PASSWORD SECTION */}
              <div className="md:col-span-2 space-y-6">
                {/* Current Password - Always shown, toggleable in edit mode only if editing */}
                <InputField
                  label="Current Password"
                  type="password"
                  value={isEditing ? "" : currentPassword}
                  placeholder={isEditing ? "Enter current password" : undefined}
                  state={isEditing ? "editable" : "readonly"}
                />

                {/* Only show these when editing */}
                {isEditing && (
                  <>
                    <InputField
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      showPasswordToggle={true}
                      state="editable"
                    />

                    <InputField
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      showPasswordToggle={true}
                      state="editable"
                      error={confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : ""}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-end">
              {isEditing ? (
                <>
                  <Button
                    text="Save Changes"
                    backgroundColor="bg-red-600 hover:bg-red-700"
                    textColor="text-white"
                    size="lg"
                    onClick={handleSave}
                  />
                  <Button
                    text="Cancel"
                    backgroundColor="bg-gray-300 hover:bg-gray-400"
                    textColor="text-gray-800"
                    size="lg"
                    onClick={handleCancel}
                  />
                </>
              ) : (
                <Button
                  text="Edit Profile"
                  backgroundColor="bg-red-600 hover:bg-red-700"
                  textColor="text-white"
                  size="lg"
                  onClick={() => setIsEditing(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;