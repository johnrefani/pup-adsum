"use client";

import { useEffect, useState } from "react";
import { Button } from "@/lib/imports";

const MasterDashboard = () => {
  const [stats, setStats] = useState({ organizations: 0, programs: 0 });
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("1st Semester");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    title: string;
    description: string;
    schoolYear?: string;
    semester?: string;
  } | null>(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmationError, setConfirmationError] = useState("");

  const fetchSettings = async () => {
    const res = await fetch("/api/main/settings");
    if (!res.ok) return;
    const data = await res.json();
    setStats(data.counts || { organizations: 0, programs: 0 });
    setSchoolYear(data.schoolYear || "");
    setSemester(data.semester || "1st Semester");
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const shiftSchoolYear = (value: string, delta: number) => {
    const match = value.match(/^(\d{4})-(\d{4})$/);
    if (!match) return "";

    const start = Number(match[1]) + delta;
    return `${start}-${start + 1}`;
  };

  const openSchoolYearConfirmation = (delta: number) => {
    const nextSchoolYear = shiftSchoolYear(schoolYear, delta);
    if (!nextSchoolYear) {
      setMessage("Current school year format is invalid.");
      return;
    }

    setMessage("");
    setMasterPassword("");
    setConfirmationError("");
    setPendingChange({
      title: delta > 0 ? "Move to Next School Year" : "Move to Previous School Year",
      description:
        delta > 0
          ? `Change school year from ${schoolYear} to ${nextSchoolYear}. Members will move up one year level.`
          : `Change school year from ${schoolYear} to ${nextSchoolYear}. Members will move down one year level.`,
      schoolYear: nextSchoolYear,
    });
  };

  const openSemesterConfirmation = (nextSemester: string) => {
    if (nextSemester === semester) return;

    setMessage("");
    setMasterPassword("");
    setConfirmationError("");
    setPendingChange({
      title: "Update Semester",
      description: `Change semester from ${semester} to ${nextSemester}.`,
      semester: nextSemester,
    });
  };

  const closeConfirmation = () => {
    if (isSaving) return;
    setPendingChange(null);
    setMasterPassword("");
    setConfirmationError("");
  };

  const handleConfirm = async () => {
    if (!pendingChange || !masterPassword.trim()) return;

    setIsSaving(true);
    setMessage("");
    setConfirmationError("");

    try {
      const res = await fetch("/api/main/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolYear: pendingChange.schoolYear,
          semester: pendingChange.semester,
          masterPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSchoolYear(data.schoolYear);
      setSemester(data.semester);
      setMessage(
        data.adjustedMembers > 0
          ? `Academic settings saved. ${data.adjustedMembers} member(s) were moved to their current year level.`
          : "Academic settings saved."
      );
      setPendingChange(null);
      setMasterPassword("");
    } catch (error) {
      setConfirmationError(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-6 overflow-hidden">
      <div>
        <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">
          Master Admin Dashboard
        </h1>
        <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">
          Overview of organizations, programs, and academic settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Organizations</p>
          <p className="text-4xl font-bold text-maroon-900 mt-2">{stats.organizations}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Programs</p>
          <p className="text-4xl font-bold text-maroon-900 mt-2">{stats.programs}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-lg md:text-xl font-bold text-red-800">Academic Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-700">School Year</span>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-2xl font-bold text-maroon-900">{schoolYear || "Loading..."}</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  text="Previous School Year"
                  backgroundColor="bg-white border border-maroon-800 hover:bg-bg"
                  textColor="text-maroon-800"
                  onClick={() => openSchoolYearConfirmation(-1)}
                  isDisabled={!schoolYear}
                />
                <Button
                  text="Next School Year"
                  backgroundColor="bg-maroon-800 hover:bg-maroon-900"
                  textColor="text-white"
                  onClick={() => openSchoolYearConfirmation(1)}
                  isDisabled={!schoolYear}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-700">Semester</span>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-2xl font-bold text-maroon-900">{semester}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Button
                  text="1st Semester"
                  backgroundColor={
                    semester === "1st Semester"
                      ? "bg-maroon-800"
                      : "bg-white border border-maroon-800 hover:bg-bg"
                  }
                  textColor={semester === "1st Semester" ? "text-white" : "text-maroon-800"}
                  onClick={() => openSemesterConfirmation("1st Semester")}
                  isDisabled={semester === "1st Semester"}
                />
                <Button
                  text="2nd Semester"
                  backgroundColor={
                    semester === "2nd Semester"
                      ? "bg-maroon-800"
                      : "bg-white border border-maroon-800 hover:bg-bg"
                  }
                  textColor={semester === "2nd Semester" ? "text-white" : "text-maroon-800"}
                  onClick={() => openSemesterConfirmation("2nd Semester")}
                  isDisabled={semester === "2nd Semester"}
                />
              </div>
            </div>
          </div>
        </div>

        {message && <p className="text-sm text-gray-600 mt-5">{message}</p>}
      </div>

      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-red-800">{pendingChange.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{pendingChange.description}</p>

            <label className="block mt-6 space-y-2">
              <span className="block text-sm font-medium text-gray-700">Master Admin Password</span>
              <input
                type="password"
                value={masterPassword}
                onChange={(event) => setMasterPassword(event.target.value)}
                placeholder="Enter password to confirm"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-800"
                disabled={isSaving}
                />
            </label>

            {confirmationError && (
              <p className="text-sm text-red-600 mt-3">{confirmationError}</p>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
              <Button
                text={isSaving ? "Confirming..." : "Confirm"}
                backgroundColor={
                  masterPassword.trim() && !isSaving
                    ? "bg-maroon-800 hover:bg-maroon-900"
                    : "bg-gray-400"
                }
                textColor="text-white"
                onClick={handleConfirm}
                isDisabled={!masterPassword.trim() || isSaving}
              />
              <Button
                text="Cancel"
                backgroundColor="bg-white border border-gray-300"
                textColor="text-gray-700"
                onClick={closeConfirmation}
                isDisabled={isSaving}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MasterDashboard;
