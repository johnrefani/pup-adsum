"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, DeletePopup } from "@/lib/imports";

type Option = {
  id: string;
  acronym?: string;
  name: string;
  department?: string;
  departmentId?: string;
};

type ArchivedMember = {
  id: string;
  fullName: string;
  idNumber: string;
  username: string;
  department: string;
  departmentId: string;
  course: string;
  courseId: string;
  courseYearRange: number;
  graduatedAt: string | null;
  status: string;
};

const yearLabel = (year: number) => {
  const suffix = year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th";
  return `${year}${suffix} Year`;
};

const MemberArchive = () => {
  const pageSize = 10;
  const [members, setMembers] = useState<ArchivedMember[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<ArchivedMember | null>(null);
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = useMemo(() => {
    if (!department) return courses;
    return courses.filter((item) => item.departmentId === department);
  }, [courses, department]);

  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));
  const paginatedMembers = members.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchFilters = async () => {
    const [deptRes, courseRes] = await Promise.all([
      fetch("/api/departments"),
      fetch("/api/courses"),
    ]);

    const deptData = await deptRes.json();
    const courseData = await courseRes.json();

    setDepartments(
      (deptData.departments || []).map((item: { _id: string; acronym: string; name: string }) => ({
        id: item._id,
        acronym: item.acronym,
        name: item.name,
      }))
    );

    setCourses(
      (courseData.courses || []).map((item: { id: string; code: string; name: string; department: string; departmentId: string }) => ({
        id: item.id,
        acronym: item.code,
        name: item.name,
        department: item.department,
        departmentId: item.departmentId,
      }))
    );
  };

  const fetchMembers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (department) params.set("department", department);
    if (course) params.set("course", course);

    try {
      const res = await fetch(`/api/main/member-archive?${params}`);
      const data = await res.json();
      setMembers(data.members || []);
      setCurrentPage(1);
      setSelectedIds((current) =>
        current.filter((id) => (data.members || []).some((member: ArchivedMember) => member.id === id))
      );
    } catch (error) {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [search, department, course]);

  useEffect(() => {
    if (course && !filteredCourses.some((item) => item.id === course)) {
      setCourse("");
    }
  }, [department, filteredCourses, course]);

  const openProfile = (member: ArchivedMember) => {
    setSelectedMember(member);
    setSelectedYearLevel("");
    setMessage("");
  };

  const allVisibleSelected =
    paginatedMembers.length > 0 &&
    paginatedMembers.every((member) => selectedIds.includes(member.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !paginatedMembers.some((member) => member.id === id))
      );
      return;
    }

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...paginatedMembers.map((member) => member.id)]))
    );
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const handleDepartmentChange = (departmentId: string) => {
    setDepartment(departmentId);
    if (course) {
      const selectedCourse = courses.find((item) => item.id === course);
      if (selectedCourse?.departmentId !== departmentId) {
        setCourse("");
      }
    }
  };

  const handleCourseChange = (courseId: string) => {
    setCourse(courseId);
    const selectedCourse = courses.find((item) => item.id === courseId);
    if (selectedCourse?.departmentId) {
      setDepartment(selectedCourse.departmentId);
    }
  };

  const closeProfile = () => {
    if (saving) return;
    setSelectedMember(null);
    setSelectedYearLevel("");
  };

  const restoreMember = async () => {
    if (!selectedMember || !selectedYearLevel) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/main/member-archive", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedMember.id, yearLevel: selectedYearLevel }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to restore member");

      setMessage(`${selectedMember.fullName} has been restored to ${yearLabel(Number(selectedYearLevel))}.`);
      setSelectedMember(null);
      setSelectedYearLevel("");
      await fetchMembers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to restore member");
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedMembers = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    setMessage("");

    try {
      const res = await fetch("/api/main/member-archive", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete archived members");

      setMessage(`${data.deletedCount || selectedIds.length} archived member(s) deleted.`);
      setSelectedIds([]);
      setDeleteOpen(false);
      await fetchMembers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete archived members");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-6 overflow-hidden">
      <div>
        <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">Member Archive</h1>
        <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">
          Review graduated members and restore members who need to repeat a year.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">Search by Name</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Enter member name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-800"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">Organization</span>
            <select
              value={department}
              onChange={(event) => handleDepartmentChange(event.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon-800"
            >
              <option value="">All organizations</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.acronym} - {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">Program</span>
            <select
              value={course}
              onChange={(event) => handleCourseChange(event.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon-800"
            >
              <option value="">All programs</option>
              {filteredCourses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.acronym} - {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {message && <p className="text-sm text-gray-600">{message}</p>}

      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-red-800">Graduated Members</h2>
              <p className="text-sm text-amber-600 mt-1">
                {members.length} archived member(s)
                {selectedIds.length > 0 ? `, ${selectedIds.length} selected` : ""}
              </p>
            </div>
            <Button
              text="Delete Selected"
              backgroundColor={
                selectedIds.length > 0
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400"
              }
              textColor="text-white"
              onClick={() => setDeleteOpen(true)}
              isDisabled={selectedIds.length === 0}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading archived members...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No graduated members found.</div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4"
                      aria-label="Select all archived members"
                    />
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Member</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">Organization</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Program</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="h-4 w-4"
                        aria-label={`Select ${member.fullName}`}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-base font-medium text-gray-900">{member.fullName}</span>
                        <span className="text-sm text-gray-500">{member.idNumber}</span>
                        <span className="text-xs text-gray-500 md:hidden">{member.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-700 hidden md:table-cell">{member.department}</td>
                    <td className="px-6 py-5 text-gray-700 hidden lg:table-cell">{member.course}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <Button
                          text="View Profile"
                          backgroundColor="bg-maroon-800 hover:bg-maroon-900"
                          textColor="text-white"
                          size="sm"
                          onClick={() => openProfile(member)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1}
              {" - "}
              {Math.min(currentPage * pageSize, members.length)}
              {" of "}
              {members.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                text="Previous"
                backgroundColor={
                  currentPage > 1
                    ? "bg-white border border-maroon-800 hover:bg-bg"
                    : "bg-gray-400"
                }
                textColor={currentPage > 1 ? "text-maroon-800" : "text-white"}
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                isDisabled={currentPage <= 1}
              />
              <span className="text-sm text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                text="Next"
                backgroundColor={
                  currentPage < totalPages
                    ? "bg-maroon-800 hover:bg-maroon-900"
                    : "bg-gray-400"
                }
                textColor="text-white"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                isDisabled={currentPage >= totalPages}
              />
            </div>
          </div>
          </>
        )}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-red-800">{selectedMember.fullName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-sm">
              <div>
                <p className="text-gray-500">ID Number</p>
                <p className="font-medium text-gray-900">{selectedMember.idNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Username</p>
                <p className="font-medium text-gray-900">{selectedMember.username}</p>
              </div>
              <div>
                <p className="text-gray-500">Organization</p>
                <p className="font-medium text-gray-900">{selectedMember.department}</p>
              </div>
              <div>
                <p className="text-gray-500">Program</p>
                <p className="font-medium text-gray-900">{selectedMember.course}</p>
              </div>
            </div>

            <label className="block mt-6 space-y-2">
              <span className="block text-sm font-medium text-gray-700">Restore as Repeating Year</span>
              <select
                value={selectedYearLevel}
                onChange={(event) => setSelectedYearLevel(event.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon-800"
                disabled={saving}
              >
                <option value="">Select year level</option>
                {Array.from({ length: selectedMember.courseYearRange }, (_, index) => index + 1).map((year) => (
                  <option key={year} value={String(year)}>
                    {yearLabel(year)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
              <Button
                text={saving ? "Restoring..." : "Restore Member"}
                backgroundColor={
                  selectedYearLevel && !saving
                    ? "bg-maroon-800 hover:bg-maroon-900"
                    : "bg-gray-400"
                }
                textColor="text-white"
                onClick={restoreMember}
                isDisabled={!selectedYearLevel || saving}
              />
              <Button
                text="Close"
                backgroundColor="bg-white border border-gray-300"
                textColor="text-gray-700"
                onClick={closeProfile}
                isDisabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      <DeletePopup
        isOpen={deleteOpen}
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
        }}
        deleteItem={deleteSelectedMembers}
        itemName={`${selectedIds.length} archived member${selectedIds.length === 1 ? "" : "s"}`}
        itemType="Archived Member"
      />
    </section>
  );
};

export default MemberArchive;
