"use client";

import React, { useState } from "react";

interface UniversalTabsProps {
  label1: string;
  label2: string;
  mLabel1?: string;
  mLabel2?: string;
  onTab1Click: () => void;
  onTab2Click: () => void;
  initialTab?: "tab1" | "tab2";
  className?: string;
}

const UniversalTabs: React.FC<UniversalTabsProps> = ({
  label1,
  label2,
  mLabel1,
  mLabel2,
  onTab1Click,
  onTab2Click,
  initialTab = "tab1",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">(initialTab);

  const handleTab1 = () => {
    setActiveTab("tab1");
    onTab1Click();
  };

  const handleTab2 = () => {
    setActiveTab("tab2");
    onTab2Click();
  };

  return (
    <div
      className={`flex mx-auto rounded-full p-1 font-medium bg-gray-100 shadow-sm whitespace-nowrap ${className}`}
    >
      {/* Tab 1 */}
      <button
        onClick={handleTab1}
        className={`flex-1 flex items-center justify-center rounded-full py-2 px-6 text-sm md:text-base font-semibold transition-all duration-300 ${
          activeTab === "tab1"
            ? "bg-red-900 text-white shadow-sm"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        <span className="hidden md:inline">{label1}</span>
        <span className="md:hidden">{mLabel1 || label1}</span>
      </button>

      {/* Tab 2 */}
      <button
        onClick={handleTab2}
        className={`flex-1 flex items-center justify-center rounded-full py-2 px-6 text-sm md:text-base font-semibold transition-all duration-300 ${
          activeTab === "tab2"
            ? "bg-red-900 text-white shadow-sm"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        <span className="hidden md:inline">{label2}</span>
        <span className="md:hidden">{mLabel2 || label2}</span>
      </button>
    </div>
  );
};

export default UniversalTabs;