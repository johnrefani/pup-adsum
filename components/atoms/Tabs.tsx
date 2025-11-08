"use client";
import React, { useState } from "react";
import { TabsProps } from "@/lib/types";

const Tabs: React.FC<TabsProps> = (tabs) => {
  const [activeTab, setActiveTab] = useState<"member" | "admin">("member");

  return (
    <div className="flex mx-auto rounded-full p-1 font-medium bg-gray-100 shadow-sm whitespace-nowrap">
      {/* Member Tab */}
      <button
        onClick={() => setActiveTab("member")}
        className={`flex-1 flex items-center justify-center rounded-full py-2 px-6 text-sm md:text-base font-semibold transition-all duration-300 ${
          activeTab === "member"
            ? "bg-red-900 text-white shadow-sm"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        Member Management
      </button>

      {/* Admin Tab */}
      <button
        onClick={() => setActiveTab("admin")}
        className={`flex-1 flex items-center justify-center rounded-full py-2 px-6 text-sm md:text-base font-semibold transition-all duration-300 ${
          activeTab === "admin"
            ? "bg-red-900 text-white shadow-sm"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        Admin Management
      </button>
    </div>
  );
};

export default Tabs;