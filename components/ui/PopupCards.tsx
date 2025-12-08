"use client";
import React from "react";
import { Button, InputField } from "@/lib/imports";
import { SuccessPopupProps, TimeInPopupProps, CoursePopupProps, DepartmentPopupProps, ManageAdminProps, ManageMemberProps, DeletePopupProps } from "@/lib/types";
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




// For Editing and Adding Course
export const CoursePopup = ({ 
  isOpen, 
  onClose, 
  department, 
  isEdit = false, 
  initialData, 
  onSubmit 
}: CoursePopupProps) => {
  const [acronym, setAcronym] = useState("");
  const [completeName, setCompleteName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [id, setId] = useState<number | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setAcronym(initialData.acronym || "");
        setCompleteName(initialData.completeName || "");
        setSelectedDepartment(initialData.department || "");
        setId(initialData.id);
      } else {
        setAcronym("");
        setCompleteName("");
        setSelectedDepartment("");
        setId(undefined);
      }
      setIsAdding(false);
    }
  }, [isOpen, isEdit, initialData, department]);

  useEffect(() => {
    setIsValid(
      acronym.trim().length > 0 &&
      completeName.trim().length > 0 &&
      selectedDepartment.trim().length > 0
    );
  }, [acronym, completeName, selectedDepartment]);

  const handleSubmit = async () => {
    if (!isValid || isAdding) return;
    setIsAdding(true);
    try {
      const program = department.find(p => p.name === selectedDepartment.trim());
      if (!program) {
        throw new Error("Invalid program selected");
      }
      await onSubmit(acronym.trim(), completeName.trim(), selectedDepartment.trim(), id);
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} course:`, error);
      alert(`Failed to ${isEdit ? "update" : "add"} course`);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  const actionText = isEdit ? "Update" : "Add";
  const actionIngText = isEdit ? "Updating" : "Adding";
  const titleText = isEdit ? "Edit Course" : "Add New Course";
  const isActive = isValid && !isAdding;
  const buttonBg = isEdit ? "bg-gold-500" : "bg-maroon-900";
  const buttonTextColor = isEdit ? "text-maroon-800" : "text-white";

  // Convert department names to Option[] format
const departmentOptions = department.map((p) => ({
  value: p.name,
  label: p.name,
}));

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
          label="Course Acronym"
          placeholder="Enter acronym"
          value={acronym}
          onChange={(e) => setAcronym(e.target.value)}
          isInvalid={acronym.trim().length === 0}
          error={acronym.trim().length === 0 ? "Course acronym is required" : ""}
          disabled={isAdding}
        />
        <InputField
          label="Complete Name"
          placeholder="Enter complete name"
          value={completeName}
          onChange={(e) => setCompleteName(e.target.value)}
          isInvalid={completeName.trim().length === 0}
          error={completeName.trim().length === 0 ? "Complete name is required" : ""}
          disabled={isAdding}
        />
        <SearchableSelectField
          label="Select Department"
          options={department.map((p) => ({
            value: p.name,
            label: p.name,
          }))}
          placeholder="Select a department"
          value={selectedDepartment}
          onChange={(value) => setSelectedDepartment(value)}
          error={selectedDepartment.trim().length === 0 ? "Department is required" : ""}
          disabled={isAdding}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-3 w-full">
        <Button
          text={isAdding ? `${actionIngText} Course...` : `${actionText} Course`}
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



//For Editing and Adding Department
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
          isInvalid={acronym.trim().length === 0}
          error={acronym.trim().length === 0 ? "Acronym is required" : ""}
          disabled={isAdding}
        />
        <InputField
          label="Complete Name"
          placeholder="Enter complete name"
          value={completeName}
          onChange={(e) => setCompleteName(e.target.value)}
          isInvalid={completeName.trim().length === 0}
          error={completeName.trim().length === 0 ? "Complete name is required" : ""}
          disabled={isAdding}
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



// For Editing and Adding Admin Account
export const ManageAdmin = ({ 
  isOpen, 
  onClose, 
  departments, 
  isEdit = false, 
  initialData, 
  onSubmit 
}: ManageAdminProps) => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [adminId, setAdminId] = useState<number | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFullname(initialData.fullname || "");
        setUsername(initialData.username || "");
        setPassword(initialData.password || "");
        setSelectedDepartment(initialData.departmentName || "");
        setAdminId(initialData.id);
      } else {
        setFullname("");
        setUsername("");
        setPassword("");
        setSelectedDepartment("");
        setAdminId(undefined);
      }
      setIsAdding(false);
    }
  }, [isOpen, isEdit, initialData, departments]);

  useEffect(() => {
    const valid = 
      fullname.trim().length > 0 &&
      username.trim().length > 0 &&
      password.trim().length > 0 &&
      selectedDepartment.trim().length > 0;

    setIsValid(valid);
  }, [fullname, username, password, selectedDepartment]);

  const handleSubmit = async () => {
    if (!isValid || isAdding) return;
    setIsAdding(true);
    try {
      const dept = departments.find(d => d.name === selectedDepartment.trim());
      if (!dept) {
        throw new Error("Invalid department selected");
      }
      await onSubmit(
        fullname.trim(),
        username.trim(),
        password.trim(),
        selectedDepartment.trim(),
        adminId
      );
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} admin:`, error);
      alert(`Failed to ${isEdit ? "update" : "add"} admin`);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  const actionText = isEdit ? "Update" : "Add";
  const actionIngText = isEdit ? "Updating" : "Adding";
  const titleText = isEdit ? "Update Admin" : "Add New Admin";
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
          label="Full Name"
          placeholder="Enter full name"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          isInvalid={fullname.trim().length === 0}
          error={fullname.trim().length === 0 ? "Full name is required" : ""}
          disabled={isAdding}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            isInvalid={username.trim().length === 0}
            error={username.trim().length === 0 ? "Username is required" : ""}
            disabled={isAdding}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={password.trim().length === 0}
            error={password.trim().length === 0 ? "Password is required" : ""}
            disabled={isAdding}
          />
        </div>

        <SearchableSelectField
          label="Department"
          options={departments.map((d) => ({
            value: d.name,
            label: d.name,
          }))}
          placeholder="Select a department"
          value={selectedDepartment}
          onChange={setSelectedDepartment} // Direct function reference
          error={selectedDepartment.trim().length === 0 ? "Department is required" : ""}
          disabled={isAdding}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-3 w-full">
        <Button
          text={isAdding ? `${actionIngText} Admin...` : `${actionText} Admin`}
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



// For Editing and Adding Member Account
export const ManageMember = ({ 
  isOpen, 
  onClose, 
  departments, 
  courses, 
  isEdit = false, 
  initialData, 
  onSubmit 
}: ManageMemberProps) => {
  const [fullname, setFullname] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [memberId, setMemberId] = useState<number | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFullname(initialData.fullname || "");
        setIdNumber(initialData.idNumber || "");
        setUsername(initialData.username || "");
        setPassword(initialData.password || "");
        setSelectedDepartment(initialData.department || "");
        setSelectedCourse(initialData.course || "");
        setSelectedYearLevel(initialData.yearLevel || "");
        setMemberId(initialData.id);
      } else {
        setFullname("");
        setIdNumber("");
        setUsername("");
        setPassword("");
        setSelectedDepartment("");
        setSelectedCourse("");
        setSelectedYearLevel("");
        setMemberId(undefined);
      }
      setIsAdding(false);
    }
  }, [isOpen, isEdit, initialData, departments, courses]);

  useEffect(() => {
    const valid =
      fullname.trim().length > 0 &&
      idNumber.trim().length > 0 &&
      username.trim().length > 0 &&
      password.trim().length > 0 &&
      selectedDepartment.trim().length > 0 &&
      selectedCourse.trim().length > 0 &&
      selectedYearLevel.trim().length > 0;

    setIsValid(valid);
  }, [fullname, idNumber, username, password, selectedDepartment, selectedCourse, selectedYearLevel]);

  const handleSubmit = async () => {
    if (!isValid || isAdding) return;
    setIsAdding(true);
    try {
      await onSubmit(
        fullname.trim(),
        idNumber.trim(),
        username.trim(),
        password.trim(),
        selectedDepartment.trim(),
        selectedCourse.trim(),
        selectedYearLevel.trim(),
        memberId
      );
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} member:`, error);
      alert(`Failed to ${isEdit ? "update" : "add"} member`);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  const actionText = isEdit ? "Update" : "Add";
  const actionIngText = isEdit ? "Updating" : "Adding";
  const titleText = isEdit ? "Update Member" : "Add New Member";
  const isActive = isValid && !isAdding;
  const buttonBg = isEdit ? "bg-gold-600" : "bg-maroon-900";
  const buttonTextColor = isEdit ? "text-maroon-900" : "text-white";

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

      <div className="flex flex-col gap-4 max-h-[50vh] overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <InputField
              label="Full Name"
              placeholder="Enter full name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              isInvalid={fullname.trim().length === 0}
              error={fullname.trim().length === 0 ? "Full name is required" : ""}
              disabled={isAdding}
            />
          </div>
          <div className="md:col-span-1">
            <InputField
              label="ID Number"
              placeholder="Enter ID number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              isInvalid={idNumber.trim().length === 0}
              error={idNumber.trim().length === 0 ? "ID number is required" : ""}
              disabled={isAdding}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            isInvalid={username.trim().length === 0}
            error={username.trim().length === 0 ? "Username is required" : ""}
            disabled={isAdding}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={password.trim().length === 0}
            error={password.trim().length === 0 ? "Password is required" : ""}
            disabled={isAdding}
          />
        </div>

        {/* Department */}
        <SearchableSelectField
          label="Select Department"
          options={departments.map((d) => ({
            value: d.name,
            label: d.name,
          }))}
          placeholder="Select a department"
          value={selectedDepartment}
          onChange={setSelectedDepartment}
          error={selectedDepartment.trim().length === 0 ? "Department is required" : ""}
          disabled={isAdding}
        />

        {/* Course */}
        <SearchableSelectField
          label="Select Course"
          options={courses.map((c) => ({
            value: c.acronym,                
            label: `${c.acronym} - ${c.name}`, 
          }))}
          placeholder="Select a course"
          value={selectedCourse}
          onChange={setSelectedCourse}
          error={selectedCourse.trim().length === 0 ? "Course is required" : ""}
          disabled={isAdding}
        />
        {/* Year Level */}
        <SearchableSelectField
          label="Select Year Level"
          options={yearLevels.map((level) => ({
            value: level,
            label: level,
          }))}
          placeholder="Select year level"
          value={selectedYearLevel}
          onChange={setSelectedYearLevel}
          error={selectedYearLevel.trim().length === 0 ? "Year level is required" : ""}
          disabled={isAdding}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-3 w-full">
        <Button
          text={isAdding ? `${actionIngText} Member...` : `${actionText} Member`}
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