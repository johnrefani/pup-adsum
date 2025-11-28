"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "@/lib/icons";
import { InputFieldProps } from "@/lib/types";

const InputField: React.FC<
  InputFieldProps & { maxLength?: number; showCharCount?: boolean }
> = ({
  name,
  icon,
  label,
  placeholder,
  undertext,
  error,
  isInvalid = false,
  state = "editable",
  className,
  inputClassName,
  value,
  onChange,
  type = "text",
  showPasswordToggle = false,
  colorClass,
  maxLength,
  min,
  showCharCount = false,
  disabled,
}) => {
  const isDisabled = state === "disabled" || disabled;

  const isReadOnly = state === "readonly";
  const [showPassword, setShowPassword] = useState(false);

  const [charCount, setCharCount] = useState(value?.toString().length || 0);

  useEffect(() => {
    setCharCount(value?.toString().length || 0);
  }, [value]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const text = e.target.value;
    if (maxLength && text.length > maxLength) return;
    setCharCount(text.length);
    onChange?.(e);
  };

  const effectiveType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  const responsiveSpacing = "py-2 pr-3 md:py-2.5 md:pr-4 lg:py-3.5 lg:pr-5";
  const responsiveText = "text-sm md:text-base lg:text-lg";
  const iconSizeClass = "text-base md:text-lg lg:text-xl";
  const leftPaddingClass = icon
    ? "pl-8 md:pl-10 lg:pl-12"
    : "pl-3 md:pl-4 lg:pl-5";
  const rightPaddingClass = showPasswordToggle
    ? "pr-10 md:pr-12 lg:pr-14"
    : "pr-3 md:pr-4 lg:pr-5";

  const baseClasses =
    "w-full h-[32px] md:h-[36px] lg:h-[42px] rounded-xl border font-medium transition duration-150 ease-in-out focus:outline-none";

  const borderColor = isInvalid
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : isDisabled
    ? "border-gray-200"
    : error
    ? "border-red-500 focus:border-red-500"
    : value && !isInvalid
    ? "border-green-500 focus:border-green-500 focus:ring-green-500"
    : "border-gray-300 focus:ring-2 focus:ring-blue-500 hover:border-blue-400";
  const defaultEditableClasses = `bg-white text-gray-800 shadow-sm ${borderColor}`;

  const editableClasses = colorClass
    ? `${colorClass} shadow-sm ${borderColor}`
    : defaultEditableClasses;

  const stateClasses = isDisabled
    ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500 placeholder-gray-400"
    : isReadOnly
    ? "bg-white border-gray-200 cursor-default text-gray-700"
    : editableClasses;

  const iconColor = isDisabled ? "text-gray-500" : "text-black";

  const inputId =
    name ||
    `input-${
      label?.replace(/\s/g, "-") ?? Math.random().toString(36).slice(2, 9)
    }`;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <div className="flex justify-between items-center">
          <label
            htmlFor={inputId}
            className={`${className} block font-medium text-black text-xs md:text-sm lg:text-base ${
              isDisabled ? "opacity-75" : "opacity-100"
            }`}
          >
            {label}
          </label>

          {showCharCount && maxLength && (
            <span
              className={`text-[10px] md:text-xs ${
                charCount > maxLength * 0.9
                  ? "text-red-600 font-semibold"
                  : "text-gray-600 pr-2"
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      <div className="relative w-full">
        {icon && (
          <div
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 ml-3 pointer-events-none ${iconColor}`}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(
                  icon as React.ReactElement<{ className?: string }>,
                  {
                    className: iconSizeClass,
                  }
                )
              : icon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={effectiveType}
          placeholder={placeholder ?? ""}
          {...(onChange
            ? { value: value ?? "", onChange: handleInputChange }
            : { defaultValue: value ?? "" })}
          disabled={isDisabled}
          readOnly={isReadOnly}
          maxLength={maxLength}
          min={min}
          className={`${
            className || ""
          } ${baseClasses} ${stateClasses} ${responsiveText} ${responsiveSpacing} ${leftPaddingClass} ${rightPaddingClass} ${
            inputClassName || ""
          }`}
        />

        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-3 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p className="font-medium text-red-500 text-[9px] md:text-xs lg:text-sm">
          {error}
        </p>
      ) : undertext ? (
        <p className="font-medium text-gray-500 text-[9px] md:text-xs lg:text-sm">
          {undertext}
        </p>
      ) : null}
    </div>
  );
};

export default InputField;
