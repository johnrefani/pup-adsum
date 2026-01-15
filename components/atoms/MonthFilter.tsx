import React from "react";
import { CustomSelect } from "@/lib/imports";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface MonthFilterProps {
  selectedMonth: string;
  selectedYear: number;
  onChange: (month: string, year: number) => void;
}

const MonthFilter = ({ selectedMonth, selectedYear, onChange }: MonthFilterProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);

  const monthOptions = months.map((m) => ({ label: m, value: m }));
  const yearOptions = years.map((y) => ({ label: y.toString(), value: y }));

  return (
    <div className="flex flex-row items-start sm:items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-3.5">
      <CustomSelect
        value={selectedMonth}
        onChange={(val) => onChange(val as string, selectedYear)}
        options={monthOptions}
        placeholder="Month"
        itemClassName="rounded-sm" // ← your rounded-sm per option
      />

      <span className="text-gray-300 hidden sm:block">|</span>

      <CustomSelect
        value={selectedYear}
        onChange={(val) => onChange(selectedMonth, val as number)}
        options={yearOptions}
        placeholder="Year"
        itemClassName="rounded-sm"
      />
    </div>
  );
};

export default MonthFilter;