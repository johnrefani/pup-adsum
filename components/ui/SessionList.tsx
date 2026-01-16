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
  department: string;
  departmentLabel: string;
  qrImageUrl?: string;
}

const SessionList: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchSessions();
  }, []);

  useEffect(() => {
    const handler = () => fetchSessions();
    window.addEventListener('session-updated', handler);
    return () => window.removeEventListener('session-updated', handler);
  }, []);

  const handleRowClick = (session: Session) => {
    setSelectedSession(session);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-600">Loading your sessions...</div>;
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] lg:max-h-[75vh] overflow-y-auto">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-2xl font-bold text-red-800">Your Sessions</h2>
        <p className="text-sm text-amber-600 mt-1">Click a row to edit</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
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
              sessions.map((session) => (
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
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-5 py-5 text-gray-700 hidden sm:table-cell">
                    {new Date(session.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-5 text-gray-700 font-medium">
                    {session.startTime} – {session.endTime}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionList;