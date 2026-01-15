// components/attendance/MonthFilter.tsx
import { ChevronDown } from "@/lib/icons";

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

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <select
        title="Select Month"
          value={selectedMonth}
          onChange={(e) => onChange(e.target.value, selectedYear)}
          className="text-sm sm:text-base font-medium text-gray-700 bg-transparent outline-none cursor-pointer appearance-none pr-6"
        >
          {months.map((m) => (
            <option className = "text-center outline-none" key={m} value={m}>{m}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 -ml-5 pointer-events-none" />
      </div>

      <span className="text-gray-400 hidden sm:block">|</span>

      <div className="flex items-center gap-2">
        <select
        title="Select Year"
          value={selectedYear}
          onChange={(e) => onChange(selectedMonth, Number(e.target.value))}
          className="text-sm sm:text-base font-medium text-gray-700 bg-transparent outline-none cursor-pointer appearance-none pr-6"
        >
          {years.map((y) => (
            <option className = "text-center outline-none" key={y} value={y}>{y}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 -ml-5 pointer-events-none" />
      </div>
    </div>
  );
};

export default MonthFilter;