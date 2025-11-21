import { useState, useEffect, useRef } from "react";
import { SearchableSelectFieldProps } from "@/lib/types";


export const SearchableSelectField: React.FC<SearchableSelectFieldProps> = ({
  label,
  options = [],
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  error,
  isInvalid = false,
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!inputValue) {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter((opt) =>
          opt.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    }
  }, [inputValue, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
  };

  const handleSelectOption = (opt: string) => {
    setInputValue(opt);
    setIsOpen(false);

    const syntheticEvent = {
      target: { name, value: opt },
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!disabled) {
        setIsOpen(false);
      }
    }, 150);
  };

  const baseClasses =
    "w-full h-[32px] md:h-[36px] lg:h-[42px] rounded-xl border font-medium transition duration-150 ease-in-out focus:outline-none";
  const responsiveSpacing = "pl-3 md:pl-4 lg:pl-5 pr-3";
  const responsiveText = "text-sm md:text-base lg:text-lg";

  const borderColor = disabled
    ? "border-gray-200"
    : isInvalid
    ? "border-red-500 focus:ring-2 focus:ring-red-400"
    : "border-gray-300 focus:ring-2 focus:ring-orange-400 hover:border-orange-400";

  const stateClasses = disabled
    ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500 placeholder-gray-400"
    : "bg-white text-gray-800 shadow-sm";

  const inputId =
    name ||
    `searchable-select-${
      label?.replace(/\s/g, "-") ?? Math.random().toString(36).slice(2, 9)
    }`;

  return (
    <div className={`space-y-2 w-full relative ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block font-medium text-black text-xs md:text-sm lg:text-base ${
            disabled ? "opacity-75" : "opacity-100"
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative w-full" ref={containerRef}>
        <input
          id={inputId}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseClasses} ${stateClasses} ${borderColor} ${responsiveText} ${responsiveSpacing} appearance-none align-middle`}
          autoComplete="off"
        />

        {isOpen && filteredOptions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-48 overflow-auto shadow-lg">
            {filteredOptions.map((option, idx) => (
              <li
                key={idx}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectOption(option);
                }}
              >
                <div className="text-sm">{option}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && !disabled && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};