"use client"

import { AdminDashboardProps } from "@/lib/types"
import { Button, CountStat } from "@/lib/imports";
import { formatDisplayDate, formatDisplayTime } from "@/lib/dateTimeFormat";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface TodaySession extends UpcomingEvent {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  unfinishedCount: number;
  timedInCount: number;
  timedInLateCount: number;
  lateUnfinishedCount: number;
  noneCount: number;
  sessionTotalCount: number;
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  unfinished: number;
  'timed-in': number;
  'timed-in-late': number;
  'late-unfinished': number;
  none: number;
  sessionTotalCount: number;
}

interface UpcomingEvent {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

const getManilaDateKey = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const parseSessionDateTime = (session: UpcomingEvent, timeKey: 'startTime' | 'endTime') => {
  const [hour, minute] = session[timeKey].split(':');
  return new Date(`${session.date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`);
};

const AdminDashboard = ({ username }: AdminDashboardProps) => {
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<TodaySession | null>(null);
  const [todaySessions, setTodaySessions] = useState<UpcomingEvent[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'current' | 'finished' | 'upcoming' | null>(null);
  
  const [previousSession, setPreviousSession] = useState<UpcomingEvent | null>(null);
  const [nextSession, setNextSession] = useState<UpcomingEvent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [finishedEvents, setFinishedEvents] = useState<UpcomingEvent[]>([]);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [statusTotals, setStatusTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async (sessionId: string, session: UpcomingEvent) => {
    try {
      const attRes = await fetch(`/api/admin/attendance-records?sessionId=${sessionId}`);
      const attData = await attRes.json();
      const students = attData.students || [];

      const summary: AttendanceSummary = attData.summary || {
        present: students.filter((s: any) => s.status === 'present').length,
        absent: students.filter((s: any) => s.status === 'absent').length,
        late: students.filter((s: any) => s.status === 'late').length,
        unfinished: students.filter((s: any) => s.status === 'unfinished').length,
        'timed-in': students.filter((s: any) => s.status === 'timed-in').length,
        'timed-in-late': students.filter((s: any) => s.status === 'timed-in-late').length,
        'late-unfinished': students.filter((s: any) => s.status === 'late-unfinished').length,
        none: students.filter((s: any) => !s.status).length,
        sessionTotalCount: students.length,
      };

      setTodaySession({
        ...session,
        presentCount: summary.present ?? 0,
        absentCount: summary.absent ?? 0,
        lateCount: summary.late ?? 0,
        unfinishedCount: summary.unfinished ?? 0,
        timedInCount: summary['timed-in'] ?? 0,
        timedInLateCount: summary['timed-in-late'] ?? 0,
        lateUnfinishedCount: summary['late-unfinished'] ?? 0,
        noneCount: summary.none ?? 0,
        sessionTotalCount: summary.sessionTotalCount ?? 0,
      });

      setStatusTotals({
        present: summary.present ?? 0,
        absent: summary.absent ?? 0,
        late: summary.late ?? 0,
        unfinished: summary.unfinished ?? 0,
        'timed-in': summary['timed-in'] ?? 0,
        'timed-in-late': summary['timed-in-late'] ?? 0,
        'late-unfinished': summary['late-unfinished'] ?? 0,
        none: summary.none ?? 0,
      });
    } catch (err) {
      console.error('Failed to fetch attendance', err);
      setTodaySession(null);
      setStatusTotals({});
    }
  };

  const getSessionStatus = (session: UpcomingEvent, now: Date) => {
    const start = parseSessionDateTime(session, 'startTime');
    const end = parseSessionDateTime(session, 'endTime');
    if (now >= start && now <= end) return 'current';
    if (now > end) return 'finished';
    return 'upcoming';
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/close-expired-sessions');

      const [sessionsRes, membersRes] = await Promise.all([
        fetch('/api/admin/my-sessions'),
        fetch('/api/members'),
      ]);

      const sessionsData = await sessionsRes.json();
      const membersData = await membersRes.json();

      if (membersRes.ok && membersData.students) {
        setTotalMembers(membersData.students.length);
      }

      if (!sessionsRes.ok || !sessionsData.sessions) {
        resetStates();
        return;
      }

      const sessions = sessionsData.sessions as UpcomingEvent[];
      const now = new Date();
      const today = getManilaDateKey(now);

      const todaySessionsList = sessions
        .filter((s) => s.date === today)
        .sort((a, b) => parseSessionDateTime(a, 'startTime').getTime() - parseSessionDateTime(b, 'startTime').getTime());

      setTodaySessions(todaySessionsList);

      // Auto-load active session if any, otherwise last session of today
      const activeIndex = todaySessionsList.findIndex((session) => {
        const start = parseSessionDateTime(session, 'startTime');
        const end = parseSessionDateTime(session, 'endTime');
        return now >= start && now <= end;
      });

      let defaultSession: UpcomingEvent | null = null;
      let defaultStatus: 'current' | 'finished' | 'upcoming' | null = null;

      if (activeIndex !== -1) {
        defaultSession = todaySessionsList[activeIndex];
        defaultStatus = 'current';
      }

      if (defaultSession) {
        setSelectedSessionId(defaultSession._id);
        setSessionStatus(defaultStatus);
        await fetchAttendance(defaultSession._id, defaultSession);
      } else {
        setTodaySession(null);
        setStatusTotals({});
        setSelectedSessionId(null);
        setSessionStatus(null);
      }

      // Global upcoming & finished
      const upcoming = sessions
        .filter((s) => parseSessionDateTime(s, 'startTime') > now)
        .sort((a, b) => parseSessionDateTime(a, 'startTime').getTime() - parseSessionDateTime(b, 'startTime').getTime())
        .slice(0, 3);

      const finished = sessions
        .filter((s) => parseSessionDateTime(s, 'endTime') < now)
        .sort((a, b) => parseSessionDateTime(b, 'endTime').getTime() - parseSessionDateTime(a, 'endTime').getTime())
        .slice(0, 3);

      setUpcomingEvents(upcoming);
      setFinishedEvents(finished);

    } catch (err) {
      console.error('Failed to load dashboard data', err);
      resetStates();
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePrevNext = (selected: UpcomingEvent, todayList: UpcomingEvent[]) => {
    const todayIndex = todayList.findIndex(s => s._id === selected._id);
    if (todayIndex !== -1) {
      setPreviousSession(todayIndex > 0 ? todayList[todayIndex - 1] : null);
      setNextSession(todayIndex < todayList.length - 1 ? todayList[todayIndex + 1] : null);
    } else {
      setPreviousSession(null);
      setNextSession(null);
    }
  };

  const resetStates = () => {
    setTodaySession(null);
    setTodaySessions([]);
    setPreviousSession(null);
    setNextSession(null);
    setUpcomingEvents([]);
    setFinishedEvents([]);
    setStatusTotals({});
    setSelectedSessionId(null);
    setSessionStatus(null);
  };

  const handleSessionSelect = async (session: UpcomingEvent) => {
    setSelectedSessionId(session._id);
    const status = getSessionStatus(session, new Date());
    setSessionStatus(status);
    await fetchAttendance(session._id, session);
  };

  const handleFinishedSessionToggle = async (session: UpcomingEvent) => {
    if (selectedSessionId !== session._id) {
      await handleSessionSelect(session);
      return;
    }

    const now = new Date();
    const currentSession = todaySessions.find((item) => getSessionStatus(item, now) === 'current');
    if (currentSession) {
      setSelectedSessionId(currentSession._id);
      setSessionStatus('current');
      await fetchAttendance(currentSession._id, currentSession);
      return;
    }

    setSelectedSessionId(null);
    setSessionStatus(null);
    setTodaySession(null);
    setStatusTotals({});
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleEventRefresh = () => {
    fetchDashboardData();
  };

  const getHeaderTitle = () => {
    if (sessionStatus === 'current') return "Current Session";
    if (sessionStatus === 'finished') return "Finished Event";
    if (sessionStatus === 'upcoming') return "Upcoming Session";
    return "Event";
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8">
      <div>
        <h1 className="font-bold text-xl md:text-2xl lg:text-[32px] ">Welcome, {username}!</h1>
        <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">Overview of Dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Attendance Overview */}
          <div className="shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg space-y-4 md:space-y-6 lg:space-y-8">
            <div>
              <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">
                Attendance Overview
              </h2>
              <p className="font-medium text-xs md:text-sm lg:text-base text-gold-600">
                {formatDisplayDate(new Date())}
              </p>
            </div>

            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : todaySession ? (
              <>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-maroon-900">{getHeaderTitle()}</p>
                  <p className="text-2xl md:text-3xl font-bold text-maroon-900">{todaySession.title}</p>
                  <p className="text-sm md:text-base lg:text-lg text-gold-600 font-medium">
                    {formatDisplayDate(todaySession.date)} • {formatDisplayTime(todaySession.startTime)} - {formatDisplayTime(todaySession.endTime)}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
                  <CountStat count={todaySession.presentCount.toString()} ringColor="border-gold-600" textColor="text-maroon-900" text="Present" />
                  <CountStat count={todaySession.absentCount.toString()} ringColor="border-maroon-900" textColor="text-gold-600" text="Absent" />
                  <CountStat count={todaySession.sessionTotalCount.toString()} ringColor="border-slate-700" textColor="text-slate-700" text="Members" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Late</p>
                    <p className="text-xl font-semibold text-maroon-900">{statusTotals.late ?? 0}</p>
                  </div>
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Unfinished Attendance</p>
                    <p className="text-xl font-semibold text-maroon-900">{statusTotals.unfinished ?? 0}</p>
                  </div>
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Timed-in</p>
                    <p className="text-xl font-semibold text-maroon-900">{statusTotals['timed-in'] ?? 0}</p>
                  </div>
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Timed-in Late</p>
                    <p className="text-xl font-semibold text-maroon-900">{statusTotals['timed-in-late'] ?? 0}</p>
                  </div>
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Late & Unfinished Attendance</p>
                    <p className="text-xl font-semibold text-maroon-900">{statusTotals['late-unfinished'] ?? 0}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-maroon-900/90 font-semibold text-lg py-12">
                No sessions available
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Upcoming Events */}
          <div className="shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg space-y-4 md:space-y-6 lg:space-y-8">
            <div>
              <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">Upcoming Events</h2>
              <p className="font-medium text-xs md:text-sm lg:text-base text-gold-600">
                Click to view attendance
              </p>
            </div>

            {loading ? (
              <div className="text-center text-gray-500">Loading events...</div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <button
                    type="button"
                    key={event._id}
                    onClick={() => handleFinishedSessionToggle(event)}
                    disabled={loading}
                    className={`w-full border p-2 md:p-3 lg:p-4 rounded-lg space-y-2 text-left transition hover:border-maroon-900 hover:bg-bg focus:outline-none focus:ring-2 focus:ring-maroon-900/40 disabled:cursor-wait disabled:opacity-70 ${
                      selectedSessionId === event._id
                        ? 'border-maroon-900 bg-maroon-50'
                        : 'border-black/25 bg-bg/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-md border border-maroon-900/20 px-2 py-1 text-xs font-semibold text-maroon-900">
                        {selectedSessionId === event._id ? 'Unselect' : 'Select'}
                      </span>
                    </div>
                    <p className="text-maroon-900 font-semibold text-base md:text-lg lg:text-xl">
                      {event.title}
                    </p>
                    <p className="text-gold-600 font-medium text-sm md:text-base">
                      {formatDisplayDate(event.date)}
                    </p>
                    <p className="text-black/65 font-medium text-sm md:text-base">
                      {formatDisplayTime(event.startTime)} - {formatDisplayTime(event.endTime)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-black/60 font-medium">No upcoming events</p>
            )}
          </div>

          {/* Finished Events */}
          <div className="shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg space-y-4 md:space-y-6 lg:space-y-8">
            <div>
              <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">Finished Events</h2>
              <p className="font-medium text-xs md:text-sm lg:text-base text-gold-600">
                Click to view attendance
              </p>
            </div>

            {loading ? (
              <div className="text-center text-gray-500">Loading events...</div>
            ) : finishedEvents.length > 0 ? (
              <div className="space-y-4">
                {finishedEvents.map((event) => (
                  <button
                    type="button"
                    key={event._id}
                    onClick={() => handleSessionSelect(event)}
                    disabled={loading}
                    className="w-full border border-black/25 bg-bg/50 p-2 md:p-3 lg:p-4 rounded-lg space-y-1 text-left transition hover:border-maroon-900 hover:bg-bg focus:outline-none focus:ring-2 focus:ring-maroon-900/40 disabled:cursor-wait disabled:opacity-70"
                  >
                    <p className="text-maroon-900 font-semibold text-base md:text-lg lg:text-xl">
                      {event.title}
                    </p>
                    <p className="text-gold-600 font-medium text-sm md:text-base">
                      {formatDisplayDate(event.date)}
                    </p>
                    <p className="text-black/65 font-medium text-sm md:text-base">
                      {formatDisplayTime(event.startTime)} - {formatDisplayTime(event.endTime)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-black/60 font-medium">No finished events</p>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg space-y-4 md:space-y-6 lg:space-y-8">
            <div>
              <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">Quick Shortcuts</h2>
            </div>
            <div className="flex flex-wrap gap-1 md:gap-2 lg:gap-3">
              <Button textColor="text-white" text="Generate QR" backgroundColor="bg-maroon-900" onClick={() => router.push("/sessions")} />
              <Button textColor="text-gold-600" text="View Reports" backgroundColor="bg-white border border-gold-600" onClick={() => router.push("/attendance-records")} />
              <Button textColor="text-gold-600" text="Add New Member" backgroundColor="bg-white border border-gold-600" onClick={() => router.push("/user-management")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
