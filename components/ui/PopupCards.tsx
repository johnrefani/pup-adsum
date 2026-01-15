"use client";
import React from "react";
import { Button, InputField } from "@/lib/imports";
import { TimeInPopupProps } from "@/lib/types";
import { Check, Close } from "@/lib/icons";
import { useState, useEffect } from "react";
import { SearchableSelectField } from "@/lib/imports";

const textBaseClass = "text-sm md:text-base";
const headingClass = "text-base md:text-[20px] font-bold";

const PopupWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white w-full max-w-xl rounded-lg shadow-xl relative flex flex-col p-6 gap-6">
      {children}
    </div>
  </div>
);


//For Timing In
export const TimeInPopup = ({
  isOpen,
  onClose,
  timeIn,
  item,
}: TimeInPopupProps) => {
  const [isTimingIn, setIsTimingIn] = useState(false);

  const handleTimeIn = async () => {
    if (isTimingIn) return;
    setIsTimingIn(true);
    try {
      await timeIn();
    } catch (error) {
      console.error("Error timing in:", error);
      alert("Failed to time-in");
    } finally {
      setIsTimingIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <PopupWrapper>
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className={`${headingClass} text-green-600`}>Time-In</h2>
          </div>
          <button
            aria-label="Close Popup"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
            disabled={isTimingIn}
          >
            <Close className="w-6 h-6" />
          </button>
        </div>

        <p className={`text-gray-600 ${textBaseClass}`}>
          Do you want to time in?
        </p>
      </div>

      <div className="flex flex-col bg-green-500/25 border-2 border-green-600 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className={` text-green-600 text-base font-semibold`}>
              {item}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <Button
          text={isTimingIn ? "Timing In..." : "Time In"}
          textColor="text-white"
          backgroundColor="bg-green-600 flex-1"
          onClick={handleTimeIn}
          isDisabled={isTimingIn}
        />
        <Button
          text="Cancel"
          textColor="text-black"
          backgroundColor="border-1 border-black/25 bg-white flex-1"
          onClick={onClose}
          isDisabled={isTimingIn}
        />
      </div>
    </PopupWrapper>
  );
};

// Main Course Popup (Add/Edit)
export interface CoursePopupProps {
  isOpen: boolean;
  onClose: () => void;
  department: Array<{ id: number; acronym: string; name: string }>;
  isEdit?: boolean;
  initialData?: {
    id: string;
    acronym: string;
    completeName: string;
    department: string;
  };
  onSubmit: (
    acronym: string,
    completeName: string,
    departmentName: string,
    id?: string
  ) => Promise<void>;
}

export const CoursePopup = ({
  isOpen,
  onClose,
  department,
  isEdit = false,
  initialData,
  onSubmit,
}: CoursePopupProps) => {
  const [acronym, setAcronym] = useState("");
  const [completeName, setCompleteName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setAcronym(initialData.acronym || "");
        setCompleteName(initialData.completeName || "");
        setSelectedDepartment(initialData.department || "");
      } else {
        setAcronym("");
        setCompleteName("");
        setSelectedDepartment("");
      }
    }
  }, [isOpen, isEdit, initialData]);

  const isFormValid =
    acronym.trim().length > 0 &&
    completeName.trim().length > 0 &&
    selectedDepartment.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(
        acronym.trim(),
        completeName.trim(),
        selectedDepartment.trim(),
        isEdit ? initialData?.id : undefined
      );
      // Form closes via parent callback — no need to call onClose() here
    } catch (error: any) {
      alert(error.message || `Failed to ${isEdit ? "update" : "add"} course`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const titleText = isEdit ? "Edit Course" : "Add New Course";
  const actionText = isEdit ? "Update" : "Add";
  const actionIngText = isEdit ? "Updating" : "Adding";
  const buttonBg = isEdit ? "bg-gold-500 hover:bg-gold-600" : "bg-maroon-900 hover:bg-maroon-800";

  return (
    <PopupWrapper>
      <div className="relative">
        <button
          aria-label="Close Popup"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <Close className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className={headingClass}>{titleText}</h2>
          <p className="text-gray-600 mt-1">Fill in all fields to continue.</p>
        </div>

        <div className="space-y-5">
          <InputField
            label="Course Acronym"
            placeholder="e.g. BSIT"
            value={acronym}
            onChange={(e) => setAcronym(e.target.value.toUpperCase())}
            disabled={isSubmitting}
          />

          <InputField
            label="Complete Name"
            placeholder="e.g. Bachelor of Science in Information Technology"
            value={completeName}
            onChange={(e) => setCompleteName(e.target.value)}
            disabled={isSubmitting}
          />

          <SearchableSelectField
            label="Department"
            options={department.map((d) => ({ value: d.name, label: d.name }))}
            placeholder="Select a department"
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            text={isSubmitting ? `${actionIngText}...` : `${actionText} Course`}
            backgroundColor={
              isFormValid && !isSubmitting
                ? buttonBg
                : "bg-gray-400 cursor-not-allowed"
            }
            textColor="text-white"
            onClick={handleSubmit}
            isDisabled={!isFormValid || isSubmitting}
          />

          <Button
            text="Cancel"
            backgroundColor="bg-white border border-gray-300"
            textColor="text-gray-700"
            onClick={onClose}
            isDisabled={isSubmitting}
          />
        </div>
      </div>
    </PopupWrapper>
  );
};
export interface ManageAdminProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Array<{ id: number; acronym: string; name: string }>;
  isEdit?: boolean;
  initialData?: {
    id: string;
    fullname: string;
    username: string;
    password?: string;
    departmentName: string;
  };
  onSubmit: (
    fullname: string,
    username: string,
    password: string,
    departmentName: string,
    id?: string
  ) => Promise<void>;
}

export const ManageAdmin = ({
  isOpen,
  onClose,
  departments,
  isEdit = false,
  initialData,
  onSubmit,
}: ManageAdminProps) => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [adminId, setAdminId] = useState<string | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFullname(initialData.fullname || "");
        setUsername(initialData.username || "");
        setPassword(""); // Never prefill
        setSelectedDepartment(initialData.departmentName || "");
        setAdminId(initialData.id);
      } else {
        setFullname("");
        setUsername("");
        setPassword("");
        setSelectedDepartment("");
        setAdminId(undefined);
      }
      setShowSuccess(false);
      setIsLoading(false);
    }
  }, [isOpen, isEdit, initialData]);

  useEffect(() => {
    const valid =
      fullname.trim().length > 0 &&
      username.trim().length > 0 &&
      (isEdit || password.trim().length > 0) &&
      selectedDepartment.trim().length > 0;
    setIsValid(valid);
  }, [fullname, username, password, selectedDepartment, isEdit]);

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    setIsLoading(true);
    try {
      await onSubmit(
        fullname.trim(),
        username.trim(),
        password.trim(),
        selectedDepartment.trim(),
        adminId
      );
      setShowSuccess(true);
    } catch (error: any) {
      alert(error.message || `Failed to ${isEdit ? "update" : "add"} admin`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const actionText = isEdit ? "Update" : "Add";
  const actionIngText = isEdit ? "Updating" : "Adding";
  const titleText = isEdit ? "Update Admin" : "Add New Admin";

  return (
    <>
      {!showSuccess ? (
        <PopupWrapper>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={headingClass}>{titleText}</h2>
              <p className={textBaseClass}>Input required information.</p>
            </div>
            <button aria-label="close" onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-700">
              <Close className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <InputField label="Full Name" placeholder="Enter full name" value={fullname} onChange={(e) => setFullname(e.target.value)} disabled={isLoading} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Username" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
              <InputField
                label="Password"
                type="password"
                placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <SearchableSelectField
              label="Department"
              options={departments.map((d) => ({ value: d.name, label: d.name }))}
              placeholder="Select department"
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              disabled={isLoading}
            />
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-3 justify-end">
            <Button
              text={isLoading ? `${actionIngText}...` : `${actionText} Admin`}
              textColor="text-white"
              backgroundColor={isValid && !isLoading ? "bg-maroon-800 hover:bg-maroon-900" : "bg-gray-400"}
              onClick={handleSubmit}
              isDisabled={!isValid || isLoading}
            />
            <Button text="Cancel" textColor="text-black" backgroundColor="bg-white border border-black/25" onClick={onClose} isDisabled={isLoading} />
          </div>
        </PopupWrapper>
      ) : (
        <SuccessPopup
          isOpen={showSuccess}
          onClose={onClose}
          title={isEdit ? "Admin Updated Successfully!" : "Admin Added Successfully!"}
          message={isEdit ? "The admin has been updated." : "The new admin account has been created."}
        />
      )}
    </>
  );
};

interface Student {
  id: string;
  fullName: string;
  idNumber: string;
  username: string;
  course: string;
  courseId: string;
  yearLevel: string;
}

interface ManageMemberProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  student?: Student | null;
}

export const ManageMember = ({ isOpen, onClose, onSuccess, student }: ManageMemberProps) => {
  const [fullname, setFullname] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const isEdit = !!student;
  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/courses')
        .then(r => r.json())
        .then(d => setCourses(d.courses || []));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && student) {
      setFullname(student.fullName);
      setIdNumber(student.idNumber);
      setUsername(student.username);
      setPassword(""); 
      setSelectedCourse(student.courseId); 
      setSelectedYearLevel(student.yearLevel);
    } else if (isOpen) {
      setFullname(""); setIdNumber(""); setUsername(""); setPassword(""); setSelectedCourse(""); setSelectedYearLevel("");
    }
  }, [isOpen, student]);

  const requiredFilled = fullname && idNumber && username && selectedCourse && selectedYearLevel;
  const canSubmit = isEdit ? requiredFilled : requiredFilled && password;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);

    const payload: any = {
      fullName: fullname.trim(),
      idNumber: idNumber.trim(),
      username: username.trim(),
      course: selectedCourse,
      yearLevel: selectedYearLevel.replace(/(st|nd|rd|th) Year/, '').trim(),
    };

    if (isEdit) {
      payload.id = student?.id;
      if (password.trim()) payload.password = password.trim();
    } else {
      payload.password = password.trim();
    }

    try {
      const res = await fetch('/api/members', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      onSuccess?.();
    } catch (e: any) {
      alert(e.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <PopupWrapper>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={headingClass}>{isEdit ? 'Edit Member' : 'Add New Member'}</h2>
          <p className={`text-gray-600 ${textBaseClass}`}>All fields with * are required.</p>
        </div>
        <button aria-label="close" onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
          <Close className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full Name *" value={fullname} onChange={e => setFullname(e.target.value)} disabled={loading} />
          <InputField label="ID Number *" value={idNumber} onChange={e => setIdNumber(e.target.value)} disabled={loading} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Username *" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
          <InputField
            label={isEdit ? "New Password (optional)" : "Password *"}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <SearchableSelectField
          label="Course *"
          placeholder="Select course"
          options={courses}
          value={selectedCourse}
          onChange={setSelectedCourse}
          disabled={loading}
        />

        <SearchableSelectField
          label="Year Level *"
          placeholder="Select year"
          options={yearLevels.map(y => ({ value: y, label: y }))}
          value={selectedYearLevel}
          onChange={setSelectedYearLevel}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button
          text={loading ? "Saving..." : (isEdit ? "Update Member" : "Add Member")}
          backgroundColor={canSubmit ? "bg-red-900 hover:bg-red-700" : "bg-gray-400"}
          textColor="text-white"
          onClick={handleSubmit}
          isDisabled={!canSubmit || loading}
        />
        <Button
          text="Cancel"
          backgroundColor="bg-white border border-gray-300"
          textColor="text-gray-700"
          onClick={onClose}
          isDisabled={loading}
        />
      </div>
    </PopupWrapper>
  );
};



export interface DeletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  deleteItem: () => Promise<void>;
  itemName: string;
  itemType: string; // "Department", "Admin", "Member"
}


//For Deleting Department, Admin, and Member Records
export const DeletePopup = ({
  isOpen,
  onClose,
  deleteItem,
  itemName,
  itemType,
}: DeletePopupProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteItem();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const title = `Delete ${itemType}`;

  return (
    <PopupWrapper>
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className={`${headingClass} text-red-600`}>{title}</h2>
          </div>
          <button
            aria-label="Close Popup"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
            disabled={isDeleting}
          >
            <Close className="w-6 h-6" />
          </button>
        </div>

        <p className={`text-gray-600 ${textBaseClass}`}>
          Are you sure you want to delete?
        </p>
      </div>

      <div className="flex flex-col bg-red-500/25 border-2 border-red-600 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className={`text-red-600 text-base font-semibold`}>
              {itemName}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-3 w-full">
        <Button
          text={isDeleting ? "Deleting..." : "Delete"}
          textColor="text-white"
          backgroundColor={
            isDeleting
              ? "bg-gray-400 flex-1 cursor-not-allowed"
              : "bg-red-600 flex-1"
          }
          onClick={handleDelete}
          isDisabled={isDeleting}
        />
        <Button
          text="Cancel"
          textColor="text-black"
          backgroundColor="bg-white border border-black/25 flex-1"
          onClick={onClose}
          isDisabled={isDeleting}
        />
      </div>
    </PopupWrapper>
  );
};

export interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

// For any successful process
export const SuccessPopup = ({ isOpen, onClose, title, message }: SuccessPopupProps) => {
  if (!isOpen) return null;
  return (
    <PopupWrapper>
      <div className="flex flex-col gap-4 text-center">
        <button
          aria-label="Close Popup"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <Close className="w-6 h-6" />
        </button>
        <div className="flex-center rounded-full bg-green-500 w-18 h-18 md:w-24 md:h-24 lg:w-28 lg:h-28 place-self-center">
          <Check className="text-white text-4xl md:text-5xl lg:text-6xl" />
        </div>
        <h2 className={headingClass}>{title}</h2>
        <p className={`text-black ${textBaseClass}`}>{message}</p>
        <div className="flex justify-end">
          <Button
            text="Close"
            textColor="text-black"
            backgroundColor="border-1 border-black/25 bg-white"
            onClick={onClose}
          />
        </div>
      </div>
    </PopupWrapper>
  );
};

export interface DepartmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  initialData?: {
    id: number;
    acronym: string;
    name: string;
  };
  onSubmit: (acronym: string, name: string, id?: number) => Promise<void>;
}

// For Editing and Adding Department
export const DepartmentPopup = ({ 
  isOpen, 
  onClose, 
  isEdit = false, 
  initialData, 
  onSubmit 
}: DepartmentPopupProps) => {
  const [acronym, setAcronym] = useState("");
  const [completeName, setCompleteName] = useState("");
  const [id, setId] = useState<number | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setAcronym(initialData.acronym || "");
        setCompleteName(initialData.name || "");
        setId(initialData.id);
      } else {
        setAcronym("");
        setCompleteName("");
        setId(undefined);
      }
      setIsAdding(false);
    }
  }, [isOpen, isEdit, initialData]);

  useEffect(() => {
    setIsValid(
      acronym.trim().length > 0 &&
      completeName.trim().length > 0
    );
  }, [acronym, completeName]);

  const handleSubmit = async () => {
    if (!isValid || isAdding) return;
    setIsAdding(true);
    try {
      await onSubmit(acronym.trim(), completeName.trim(), id);
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} department:`, error);
      alert(`Failed to ${isEdit ? "update" : "add"} department`);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  const actionText = isEdit ? "Update" : "Add";
  const actionIngText = isEdit ? "Updating" : "Adding";
  const titleText = isEdit ? "Update Department" : "Add New Department";
  const isActive = isValid && !isAdding;
  const buttonBg = isEdit ? "bg-gold-500" : "bg-maroon-900";
  const buttonTextColor = isEdit ? "text-maroon-800" : "text-white";

  return (
    <PopupWrapper>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={headingClass}>{titleText}</h2>
          </div>
          <p className={`text-gray-600 ${textBaseClass}`}>
            Input required information.
          </p>
        </div>

        <button
          aria-label="Close Popup"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
          disabled={isAdding}
        >
          <Close className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <InputField
          label="Acronym"
          placeholder="Enter acronym"
          value={acronym}
          onChange={(e) => setAcronym(e.target.value)}
          disabled={isAdding}
          // Removed isInvalid & error props completely
        />
        <InputField
          label="Complete Name"
          placeholder="Enter complete name"
          value={completeName}
          onChange={(e) => setCompleteName(e.target.value)}
          disabled={isAdding}
          // Removed isInvalid & error props completely
        />
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-3 w-full">
        <Button
          text={isAdding ? `${actionIngText} Department...` : `${actionText} Department`}
          textColor={isActive ? buttonTextColor : "text-white"}
          backgroundColor={
            isActive
              ? `${buttonBg} flex-1`
              : "bg-gray-400 flex-1 cursor-not-allowed"
          }
          onClick={handleSubmit}
          isDisabled={!isValid || isAdding}
        />
        <Button
          text="Cancel"
          textColor="text-black"
          backgroundColor="bg-white border-1 border-black/25 flex-1"
          onClick={onClose}
          isDisabled={isAdding}
        />
      </div>
    </PopupWrapper>
  );
};