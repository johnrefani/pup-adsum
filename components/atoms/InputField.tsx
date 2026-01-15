"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "@/lib/icons";

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  type?: string;
  name?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  className?: string;
  register?: any;
  state?: "editable" | "readonly" | "disabled";   // ← NEW
  [key: string]: any;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder = "",
  type = "text",
  name,
  error,
  value,
  defaultValue,
  onChange,
  disabled = false,
  icon,
  showPasswordToggle = false,
  className = "",
  register,
  state = "editable",   // default to editable
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(value || defaultValue || "");

  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const effectiveType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  // Determine final input state
  const isDisabled = disabled || state === "disabled";
  const isReadOnly = state === "readonly" || isDisabled;

  const hasError = !!error;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          {...(register ? register(name) : {})}
          type={effectiveType}
          name={name}
          value={value !== undefined ? value : internalValue}
          defaultValue={defaultValue}
          onChange={!isReadOnly ? handleChange : undefined}
          disabled={isDisabled}
          readOnly={isReadOnly && !isDisabled}   // readOnly + not disabled = classic readonly style
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-xl border transition-all duration-200
            ${icon ? "pl-10" : "pl-4"}
            ${showPasswordToggle ? "pr-12" : "pr-4"}
            text-sm md:text-base
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
            ${
              hasError
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-300 hover:border-gray-400"
            }
            ${
              isDisabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : state === "readonly"
                ? "bg-gray-50 text-gray-800 cursor-default"
                : "bg-white text-gray-900 cursor-text"
            }
          `}
          {...rest}
        />

        {showPasswordToggle && type === "password" && !isDisabled && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isDisabled}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};

export default InputField;