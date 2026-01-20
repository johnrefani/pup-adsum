"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, InputField } from "@/lib/imports";
import { Camera } from "@/lib/icons";

interface ProfileData {
  fullName: string;
  schoolId: string;
  username: string;
  course: string;
  yearLevel: string;
  department: string;
  profilePicture: string | null;
}

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ProfileData>({
    fullName: "",
    schoolId: "",
    username: "",
    course: "",
    yearLevel: "",
    department: "",
    profilePicture: null,
  });

  const [Password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/my-account");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();

      const updatedData: ProfileData = {
        fullName: data.fullName || "",
        schoolId: data.schoolId || "",
        username: data.username || "",
        department: data.departmentFormatted || "",
        course: data.courseFormatted || "",
        yearLevel: data.yearLevel || "",
        profilePicture: data.profilePicture || null,
      };

      setFormData(updatedData);
      setPreviewPhoto(data.profilePicture);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePhotoClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setSaving(true);
    setError("");

    const submitData = new FormData();

    submitData.append("username", formData.username);
    submitData.append("fullName", formData.fullName);

    if (newPassword.trim()) {
      submitData.append("password", newPassword.trim());
    }

    const photoFile = fileInputRef.current?.files?.[0];
    if (photoFile) {
      submitData.append("photo", photoFile);
    }

    try {
      const res = await fetch("/api/user/my-account", {
        method: "PUT",
        body: submitData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Update failed");
      }

      alert("Profile updated successfully!");

      setIsEditing(false);
      setNewPassword("");
      setConfirmPassword("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      await loadProfile();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    loadProfile();
  };

  if (loading) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-6">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-800 text-center md:text-left">
        {isEditing ? "Edit Profile" : "My Profile"}
      </h1>

      {error && <p className="text-red-600 text-center mb-6 font-medium">{error}</p>}

      <div className="p-6 md:p-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Profile Photo Section */}
          <div className="w-full lg:w-80 flex flex-col items-center">
            <div
              onClick={handlePhotoClick}
              className={`relative w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-2xl border-4 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden transition-all ${
                isEditing ? "hover:border-yellow-500 hover:shadow-lg cursor-pointer" : ""
              }`}
            >
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-20 h-20 text-gray-400" />
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-60 transition rounded-2xl">
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
                  onChange={handlePhotoChange}
                  className="hidden"
                  aria-label="Profile Picture"
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
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                state={isEditing ? "editable" : "readonly"}
                placeholder="Enter full name"
              />

              <InputField
                label="School ID"
                value={formData.schoolId}
                state={isEditing ? "disabled" : "readonly"}
              />

              <InputField
                label="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                state={isEditing ? "editable" : "readonly"}
                placeholder="Enter username"
              />

              <InputField
                label="Organization"
                value={formData.department}
                state={isEditing ? "disabled" : "readonly"}
              />

              <InputField
                label="Program"
                value={formData.course}
                state={isEditing ? "disabled" : "readonly"}
              />

              <InputField
                label="Year Level"
                value={formData.yearLevel}
                state={isEditing ? "disabled" : "readonly"}
              />

              <div className="md:col-span-2 space-y-6">
                <InputField
                  label="Current Password"
                  type="password"
                  value={isEditing ? Password : "••••••••••••"}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? "Leave blank to keep current" : ""}
                  showPasswordToggle={isEditing}          // ← key change
                  state={isEditing ? "editable" : "readonly"}
                />

                {isEditing && (
                  <>
                    <InputField
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (optional)"
                      showPasswordToggle={true}
                      state={isEditing ? "editable" : "readonly"}
                    />

                    <InputField
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      showPasswordToggle={true}
                      state={isEditing ? "editable" : "readonly"}
                      error={
                        confirmPassword && newPassword !== confirmPassword
                          ? "Passwords do not match"
                          : ""
                      }
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-end">
              {isEditing ? (
                <>
                  <Button
                    text={saving ? "Saving..." : "Save Changes"}
                    backgroundColor="bg-red-600 hover:bg-red-700"
                    textColor="text-white"
                    size="lg"
                    onClick={handleSave}
                    isDisabled={saving}
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