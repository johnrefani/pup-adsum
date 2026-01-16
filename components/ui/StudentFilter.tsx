"use client";
import React, { useState, useEffect } from 'react';
import { InputField, SearchableSelectField } from '@/lib/imports';
import { Filter } from '@/lib/icons';

type Option = { value: string; label: string };

type SessionInfo = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  departmentAcronym: string;
};

type StudentFilterProps = {
  onFiltersChange: (filters: {
    sessionId: string;
    courseId: string;
    yearLevel: string;
    search: string;
  }) => void;
  onSessionChange?: (info: SessionInfo | null) => void;
  onCourseChange?: (name: string) => void;
};

export default function StudentFilter({
  onFiltersChange,
  onSessionChange,
  onCourseChange,
}: StudentFilterProps) {
  const [sessions, setSessions] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);

  const [sessionId, setSessionId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [search, setSearch] = useState('');

  const yearLevelOptions: Option[] = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  useEffect(() => {
    fetch('/api/admin/my-sessions')
      .then(r => r.json())
      .then(data => {
        const opts: Option[] = (data.sessions || []).map((s: any) => ({
          value: s._id,
          label: `${s.title} - ${s.date} (${s.startTime}-${s.endTime})`,
        }));
        setSessions(opts);
      });
  }, []);

  useEffect(() => {
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then(data => {
        const opts: Option[] = data.courses || [];
        setCourses(opts);
      });
  }, []);

  useEffect(() => {
    onFiltersChange({ sessionId, courseId, yearLevel, search });
  }, [sessionId, courseId, yearLevel, search]);

  const handleSessionChange = (value: string) => {
    setSessionId(value);
    const selected = sessions.find(s => s.value === value);
    if (selected && onSessionChange) {
      const match = selected.label.match(/^(.*?) - (\d{4}-\d{2}-\d{2}) \(([^)-]+)-([^\)]+)\)/);
      if (match) {
        const [, title, date, start, end] = match;
        const dept = selected.label.match(/\(([^()]+)\)$/)?.[1] || 'DEPT';
        onSessionChange({
          title: title.trim(),
          date,
          startTime: start.trim(),
          endTime: end.trim(),
          departmentAcronym: dept,
        });
      } else {
        onSessionChange(null);
      }
    } else {
      onSessionChange?.(null);
    }
  };

  const handleCourseChange = (value: string) => {
    setCourseId(value);
    const selected = courses.find(c => c.value === value);
    onCourseChange?.(selected?.label || '');
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl">
      <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6 flex items-center gap-3 text-lg md:text-xl lg:text-2xl">
        <Filter />
        <h2 className="font-bold text-gray-800">Filters</h2>
      </div>

      <div className="p-8 lg:p-10 space-y-8">
        <div>
          <SearchableSelectField
            placeholder="Select session..."
            label='Session'
            options={sessions}
            value={sessionId}
            onChange={handleSessionChange}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SearchableSelectField
              placeholder="Select course..."
              label='Course'
              options={courses}
              value={courseId}
              onChange={handleCourseChange}
            />
          </div>

          <div>
            <SearchableSelectField
              placeholder="Select year..."
              label='Year Level'
              options={yearLevelOptions}
              value={yearLevel}
              onChange={(v: string) => setYearLevel(v)}
            />
          </div>
        </div>

        <div>
          <InputField
            placeholder="Search by name or ID..."
            type="text"
            label='Search'
            state="editable"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}