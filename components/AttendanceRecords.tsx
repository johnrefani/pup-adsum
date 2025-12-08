"use client";

import StudentFilter from '@/components/ui/StudentFilter';
import StudentList from '@/components/ui/StudentList';
import { useState } from 'react';

export default function AttendanceRecords() {
  const [filters, setFilters] = useState({
    sessionId: '',
    courseId: '',
    yearLevel: '',
    search: '',
  });

  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [courseName, setCourseName] = useState('');

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-8">
      <div>
        <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">Attendance Records</h1>
        <p className="text-black/75">Detailed list of all attendance logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StudentFilter
          onFiltersChange={setFilters}
          onSessionChange={setSessionInfo}
          onCourseChange={setCourseName}
        />
        <StudentList
          {...filters}
          sessionInfo={sessionInfo}
          courseName={courseName}
        />
      </div>
    </section>
  );
}