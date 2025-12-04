"use client";

import { useState } from "react";
import {
  StudentData,
  Tabs,
  UserFilter,
} from "@/lib/imports";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<"member" | "admin">("member");

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8 overflow-hidden">
      <div className="grid grid-cols-1 lg:flex lg:justify-between lg:items-end space-y-4 md:space-y-6 lg:space-y-0">
        <div>
          <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">
            User Management
          </h1>
          <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">
            Manage Accounts and other Information.
          </p>
        </div>

        {/* Tabs */}
        <div>
            <Tabs
                label1="Member Management"
                mLabel1="Manage Member"
                label2="Admin Management"
                mLabel2="Manage Admin"
                initialTab={activeTab === "member" ? "tab1" : "tab2"}
                onTab1Click={() => setActiveTab("member")}
                onTab2Click={() => setActiveTab("admin")}
                className="w-full lg:w-auto"
             />
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {activeTab === "member" ? (
          <>
            <UserFilter />
            <StudentData />
          </>
        ) : (
          <>
            
          </>
        )}
      </div>
    </section>
  );
};

export default UserManagement;