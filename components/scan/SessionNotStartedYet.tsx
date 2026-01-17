"use client";

import { Button } from '@/lib/imports';
import { useRouter } from 'next/navigation';

export interface SessionForClient {
  _id: string;
  title: string;
  date: string;           // ISO string like "2025-12-09T00:00:00.000Z"
  startTime: string;      // "09:00"
  endTime: string;        // "17:30"
  description?: string;
  departmentName?: string;
}

export default function SessionNotStartedYet({ session }: { session: SessionForClient }) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  // Format the start date + time nicely
  const startDateTime = new Date(session.date);
  const [startHour, startMinute] = session.startTime.split(':');
  startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-300 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center place-items-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">Session Not Started Yet</h1>
        <p className="text-lg text-gray-600 mb-6">
          The session <strong>"{session.title}"</strong> will begin at:
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-2xl font-semibold text-maroon-800">
            {session.startTime}
          </p>
          <p className="text-md text-gray-700">
            {startDateTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Please come back when the session starts to scan your attendance.
        </p>
        <div className='flex justify-center items-center'>
            <Button
          text="Go Home"
          textColor="text-white"
          backgroundColor="bg-maroon-800"
          onClick={handleGoHome}
        />
        </div>
        
      </div>
    </div>
  );
}