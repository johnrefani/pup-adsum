import { ReactNode } from "react";


export interface ButtonProps {
  textColor: string;
  backgroundColor: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  text?: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "lg" | "md" | "sm";
  isDisabled?: boolean;
  type?: "button" | "submit" | "reset";
  ref?: React.ForwardedRef<HTMLButtonElement>;
}

export interface TabsProps {
  tabs?: "member" | "admin";
}

export interface HeaderProps {
  isAdmin: boolean;
}

export interface InputFieldProps {
  name?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  maxLength?: number;
  min?: number;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  state?: "editable" | "disabled" | "readonly" | "error";
  error?: string;
  isInvalid?: boolean;
  undertext?: string;
  showPasswordToggle?: boolean;
  colorClass?: string;
  disabled?: boolean;
}

export interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export interface TimeInPopupProps {
  isOpen: boolean;
  onClose: () => void;
  timeIn: () => void;
  item: string;
}


export interface CoursePopupProps {
  isOpen: boolean;
  onClose: () => void;
  department: Array<{ id: number; acronym: string; name: string }>;
  isEdit?: boolean;
  initialData?: {
    id: number;
    acronym: string;
    completeName: string;
    department: string;
  };
  onSubmit: (acronym: string, completeName: string, department: string, id?: number) => Promise<void>;
}

export interface SearchableSelectFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  isInvalid?: boolean;
}

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


export interface ManageAdminProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Array<{ id: number; acronym: string; name: string }>;
  isEdit?: boolean;
  initialData?: {
    id: number;
    fullname: string;
    username: string;
    password?: string;
    departmentName: string;
  };
  onSubmit: (fullname: string, username: string, password: string, departmentName: string, id?: number) => Promise<void>;
}


export interface ManageMemberProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Array<{ id: number; acronym: string; name: string }>;
  courses: Array<{ id: number; acronym: string; name: string; department: string }>;
  isEdit?: boolean;
  initialData?: {
    id: number;
    fullname: string;
    idNumber: string;
    username: string;
    password?: string;
    department: string;
    course: string;
    yearLevel: string;
  };
  onSubmit: (fullname: string, idNumber: string, username: string, password: string, department: string, course: string, yearLevel: string, id?: number) => Promise<void>;
}


export interface DeletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  deleteItem: () => Promise<void>;
  itemName: string;
  itemType: string; // "Department", "Admin", "Member"
}

export interface CountStatProps {
    count: string;
    ringColor: string;
    textColor: string;
    text: string;
}

export interface StatusProps {
    isPresent: boolean;
}


export interface AdminDashboardProps {
    username: string;
}

export interface MemberDashboardProps {
    username: string;
}