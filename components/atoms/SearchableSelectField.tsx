// components/ui/SearchableSelectField.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectFieldProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const SearchableSelectField: React.FC<SearchableSelectFieldProps> = ({
  label,
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option...",
  error,
  disabled = false,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selected = options.find((opt) => opt.value === value);
    setQuery(selected?.label ?? "");
  }, [value, options]);

  const filteredOptions = options.filter((opt) => {
    const label = opt?.label ?? "";
    return label.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setQuery(option.label ?? "");
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border transition-all text-sm md:text-base
            focus:outline-none focus:ring-2 focus:ring-red-500
            ${error ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          `}
        />

        {/* Dropdown */}
        {isOpen && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-xl max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onMouseDown={(e) => e.preventDefault()} // prevents input blur
                  onClick={() => handleSelect(opt)}
                  className="px-4 py-3 hover:bg-red-50 cursor-pointer text-sm transition"
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-gray-500 text-sm text-center">
                No options found
              </li>
            )}
          </ul>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};