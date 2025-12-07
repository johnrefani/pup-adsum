// components/Profile.tsx
"use client";

import React, { useState, useRef } from "react";
import { Button, InputField, SearchableSelectField } from "@/lib/imports";
import { Camera, User, Eye, EyeOff } from "@/lib/icons";

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

const departmentOptions = ["BSED", "BEED", "BSIT", "BSCRIM", "AB English", "BSHM"];

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [showPassword, setShowPassword] = useState(false);
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
    alert("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-red-800 mb-8 text-center md:text-left">
          {isEditing ? "Edit Profile" : "Profile"}
        </h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-10">
            {/* MAIN LAYOUT: Side-by-side on tablet+, stacked on mobile */}
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              
              {/* LEFT: Profile Photo */}
              <div className="w-full lg:w-80 flex flex-col items-center">
                <div
                  onClick={handlePhotoClick}
                  className={`relative w-52 h-52 md:w-64 md:h-64 rounded-2xl border-4 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden transition-all cursor-pointer
                    ${isEditing ? "hover:border-yellow-500 hover:shadow-lg" : ""}`}
                >
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
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
                      backgroundColor="bg-yellow-500 hover:bg-yellow-600"
                      textColor="text-white font-semibold w-full mt-4"
                      onClick={handlePhotoClick}
                    />
                  </>
                )}
              </div>

              {/* RIGHT: Form Fields */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* School ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School ID</label>
                    <input
                      type="text"
                      value={formData.schoolId}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      disabled={!isEditing}
                      placeholder={isEditing ? "Select department" : ""}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <input
                      type="text"
                      value={formData.course}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                    />
                  </div>

                  {/* Year Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                    <input
                      type="text"
                      value={formData.yearLevel}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                    />
                  </div>

                  {/* Password - Always visible */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value="••••••••••••"
                        readOnly
                        className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 bg-gray-50"
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password - Only in Edit */}
                  {isEditing && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Re-type new password"
                          className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Right aligned on large screens */}
              <div className="flex flex-col justify-end sm:flex-row gap-4 mt-10 w-full lg:w-auto lg:ml-auto">
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
}

export default MyProfile;