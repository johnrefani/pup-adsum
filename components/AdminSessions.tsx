"use client";

import { useState, createContext, useContext } from "react";
import {
  SessionInformation,
  GeneratedQR,
  Tabs,
  SessionList,
} from "@/lib/imports";

// Context
type SelectedSession = {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  department: string;
  departmentLabel: string;
  qrImageUrl?: string;
} | null;

const SelectedSessionContext = createContext<{
  selectedSession: SelectedSession;
  setSelectedSession: (s: SelectedSession) => void;
}>({
  selectedSession: null,
  setSelectedSession: () => {},
});

export const useSelectedSession = () => useContext(SelectedSessionContext);

const AdminSessions = () => {
  const [activeTab, setActiveTab] = useState<"generate" | "list">("generate");
  const [selectedSession, setSelectedSession] = useState<SelectedSession>(null);

  return (
    <SelectedSessionContext.Provider value={{ selectedSession, setSelectedSession }}>
      <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:flex lg:justify-between lg:items-end space-y-4 md:space-y-6 lg:space-y-0">
          <div>
            <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">
              Manage Sessions
            </h1>
            <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">
              Generate QR Code and Manage Sessions.
            </p>
          </div>

          <div>
            <Tabs
              label1="Generate QR"
              label2="Session List"
              initialTab={activeTab === "generate" ? "tab1" : "tab2"}
              onTab1Click={() => setActiveTab("generate")}
              onTab2Click={() => setActiveTab("list")}
              className="w-full lg:w-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {activeTab === "generate" ? (
            <>
              <SessionInformation mode="create" />
              <GeneratedQR />
            </>
          ) : (
            <>
              <SessionList />
              <SessionInformation mode="edit" />
            </>
          )}
        </div>
      </section>
    </SelectedSessionContext.Provider>
  );
};

export default AdminSessions;