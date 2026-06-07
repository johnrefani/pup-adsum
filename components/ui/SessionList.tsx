"use client";

import { useEffect, useState } from 'react';
import { useSelectedSession } from '@/components/AdminSessions';

interface Session {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  semester?: string;
  schoolYear?: string;
  gracePeriodMinutes?: number;
  absentAfterMinutes?: number;
  startTimeOutBeforeEndMinutes?: number;
  timeOutLimitMinutes?: number;
  venueLocation?: { lat: number; lng: number } | null;
  allowedRadiusMeters?: number;
  department: string;
  departmentLabel: string;
  qrImageUrl?: string;
}

const SESSIONS_PER_PAGE = 8;

const SessionList: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedSession, setSelectedSession } = useSelectedSession();

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/my-sessions');
      const data = await res.json();
      if (data.error) {
        console.error(data.error);
        setSessions([]);
      } else {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await fetch('/api/admin/sessions/cleanup');
      } catch (err) {
        console.error('Old session cleanup failed:', err);
      } finally {
        await fetchSessions();
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const handler = () => fetchSessions();
    window.addEventListener('session-updated', handler);
    return () => window.removeEventListener('session-updated', handler);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sessions.length]);

  const handleRowClick = (session: Session) => {
    setSelectedSession(session);
  };

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const parsedHour = Number(hour);
    if (!Number.isFinite(parsedHour) || !minute) return time;

    const period = parsedHour >= 12 ? 'PM' : 'AM';
    const displayHour = parsedHour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const totalPages = Math.max(1, Math.ceil(sessions.length / SESSIONS_PER_PAGE));
  const pageStartIndex = (currentPage - 1) * SESSIONS_PER_PAGE;
  const paginatedSessions = sessions.slice(pageStartIndex, pageStartIndex + SESSIONS_PER_PAGE);
  const visibleStart = sessions.length === 0 ? 0 : pageStartIndex + 1;
  const visibleEnd = Math.min(pageStartIndex + SESSIONS_PER_PAGE, sessions.length);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-600">Loading your sessions...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col max-h-[90vh] lg:max-h-[75vh]">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-2xl font-bold text-red-800">Your Sessions</h2>
        <p className="text-sm text-amber-600 mt-1">Click a row to edit</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full min-w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b border-gray-200">
              <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">Session Name</th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">Date</th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-500">
                  No sessions created yet.
                </td>
              </tr>
            ) : (
              paginatedSessions.map((session) => (
                <tr
                  key={session._id}
                  onClick={() => handleRowClick(session)}
                  className={`cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedSession?._id === session._id ? 'bg-blue-100 ring-2 ring-blue-400' : ''
                  }`}
                >
                  <td className="px-5 py-5">
                    <div className="font-medium text-gray-900">{session.title}</div>
                    <div className="text-sm text-gray-500 sm:hidden">
                      {formatDate(session.date)}
                    </div>
                  </td>
                  <td className="px-5 py-5 text-gray-700 hidden sm:table-cell">
                    {formatDate(session.date)}
                  </td>
                  <td className="px-5 py-5 text-gray-700 font-medium">
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Showing {visibleStart}-{visibleEnd} of {sessions.length} sessions
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                    currentPage === page
                      ? 'bg-red-800 text-white'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionList;
