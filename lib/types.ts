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

