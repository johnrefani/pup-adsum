"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "@/lib/icons"; // adjust path if needed

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ label: string; value: string | number }>;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  disabled?: boolean;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  triggerClassName = "",
  contentClassName = "",
  itemClassName = "",
  disabled = false,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, options, onChange]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger button */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            !disabled && setIsOpen(true);
          }
        }}
        className={`
          flex items-center justify-between gap-2 px-4 md:px-4 lg:px-6 text-sm sm:text-base font-medium text-gray-800 cursor-pointer
        `}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <ul
          role="listbox"
          aria-activedescendant={
            highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined
          }
          className={`
            absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md
            max-h-40 overflow-auto py-1 text-sm
            ${contentClassName}
          `}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`option-${index}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                px-3 py-2 cursor-pointer
                ${option.value === value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-800"}
                ${highlightedIndex === index ? "bg-gray-100" : ""}
                hover:bg-gray-100 transition-colors
                rounded-sm mx-1
                ${itemClassName}
              `}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;