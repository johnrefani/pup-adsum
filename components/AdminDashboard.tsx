"use client"

import { AdminDashboardProps } from "@/lib/types"
import { Button, CountStat } from "@/lib/imports";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

const AdminDashboard = ({ username }: AdminDashboardProps) => {
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<TodaySession | null>(null);
  const [todaySessions, setTodaySessions] = useState<UpcomingEvent[]>([]);
  const [previousSession, setPreviousSession] = useState<UpcomingEvent | null>(null);
  const [nextSession, setNextSession] = useState<UpcomingEvent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [finishedEvents, setFinishedEvents] = useState<UpcomingEvent[]>([]);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [statusTotals, setStatusTotals] = useState<Record<string, number>>({});
  const [todaySessionEnded, setTodaySessionEnded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    const fetchDashboardData = async () => {
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
          setTodaySession(null);
          setTodaySessions([]);
          setPreviousSession(null);
          setNextSession(null);
          setUpcomingEvents([]);
          setFinishedEvents([]);
          setStatusTotals({});
          setLoading(false);
          return;
        }

        const sessions = sessionsData.sessions as UpcomingEvent[];
        const now = new Date();
        const today = getManilaDateKey(now);

        const todaySessions = sessions
          .filter((s) => s.date === today)
          .sort((a, b) => parseSessionDateTime(a, 'startTime').getTime() - parseSessionDateTime(b, 'startTime').getTime());

        setTodaySessions(todaySessions);

        const activeSessionIndex = todaySessions.findIndex((session) => {
          const start = parseSessionDateTime(session, 'startTime');
          const end = parseSessionDateTime(session, 'endTime');
          return now >= start && now <= end;
        });

        if (activeSessionIndex !== -1) {
          setTodaySessionEnded(false);

          const activeSession = todaySessions[activeSessionIndex];
          const attRes = await fetch(`/api/admin/attendance-records?sessionId=${activeSession._id}`);
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
            ...activeSession,
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

          setPreviousSession(activeSessionIndex > 0 ? todaySessions[activeSessionIndex - 1] : null);
          setNextSession(activeSessionIndex < todaySessions.length - 1 ? todaySessions[activeSessionIndex + 1] : null);
        } else {
          setTodaySession(null);
          setStatusTotals({});

          const upcomingIndex = todaySessions.findIndex((session) => parseSessionDateTime(session, 'startTime') > now);
          if (upcomingIndex !== -1) {
            setPreviousSession(upcomingIndex > 0 ? todaySessions[upcomingIndex - 1] : null);
            setNextSession(todaySessions[upcomingIndex]);
            setTodaySessionEnded(false);
          } else if (todaySessions.length > 0) {
            setPreviousSession(todaySessions[todaySessions.length - 1]);
            setNextSession(null);
            const lastSessionEnd = parseSessionDateTime(todaySessions[todaySessions.length - 1], 'endTime');
            setTodaySessionEnded(now > lastSessionEnd);
          } else {
            setPreviousSession(null);
            setNextSession(null);
            setTodaySessionEnded(false);
          }
        }

        const upcoming = sessions
          .filter((s) => parseSessionDateTime(s, 'startTime') > now)
          .sort((a, b) => parseSessionDateTime(a, 'startTime').getTime() - parseSessionDateTime(b, 'startTime').getTime())
          .slice(0, 3)
          .map((s) => ({
            _id: s._id,
            title: s.title,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
          }));

        const finished = sessions
          .filter((s) => parseSessionDateTime(s, 'endTime') < now)
          .sort((a, b) => parseSessionDateTime(b, 'endTime').getTime() - parseSessionDateTime(a, 'endTime').getTime())
          .slice(0, 3)
          .map((s) => ({
            _id: s._id,
            title: s.title,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
          }));

        setUpcomingEvents(upcoming);
        setFinishedEvents(finished);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setTodaySession(null);
        setTodaySessions([]);
        setPreviousSession(null);
        setNextSession(null);
        setUpcomingEvents([]);
        setFinishedEvents([]);
        setStatusTotals({});
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${minute} ${period}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
              <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">Attendance Overview for Today's Event</h2>
              <p className="font-medium text-xs md:text-sm lg:text-base text-gold-600">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : todaySession ? (
              <>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-maroon-900">Current Session</p>
                  <p className="text-2xl md:text-3xl font-bold text-maroon-900">{todaySession.title}</p>
                  <p className="text-sm md:text-base lg:text-lg text-gold-600 font-medium">
                    {formatTime(todaySession.startTime)} - {formatTime(todaySession.endTime)}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Previous session</p>
                    {previousSession ? (
                      <>
                        <p className="font-semibold text-maroon-900">{previousSession.title}</p>
                        <p className="text-sm text-gold-600">{formatTime(previousSession.startTime)} - {formatTime(previousSession.endTime)}</p>
                      </>
                    ) : (
                      <p className="font-medium text-black/70">None</p>
                    )}
                  </div>
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Next session</p>
                    {nextSession ? (
                      <>
                        <p className="font-semibold text-maroon-900">{nextSession.title}</p>
                        <p className="text-sm text-gold-600">{formatTime(nextSession.startTime)} - {formatTime(nextSession.endTime)}</p>
                      </>
                    ) : (
                      <p className="font-medium text-black/70">None</p>
                    )}
                  </div>
                </div>
              </>
            ) : todaySessions.length > 0 ? (
              <>
                <div className="text-center text-maroon-900/90 font-semibold text-lg">
                  {todaySessionEnded ? 'Today’s sessions have ended' : 'No session at this moment'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Previous session</p>
                    {previousSession ? (
                      <>
                        <p className="font-semibold text-maroon-900">{previousSession.title}</p>
                        <p className="text-sm text-gold-600">{formatTime(previousSession.startTime)} - {formatTime(previousSession.endTime)}</p>
                      </>
                    ) : (
                      <p className="font-medium text-black/70">None</p>
                    )}
                  </div>
                  <div className="p-3 border border-black/10 rounded-lg bg-bg/60">
                    <p className="text-sm text-black/70">Next session</p>
                    {nextSession ? (
                      <>
                        <p className="font-semibold text-maroon-900">{nextSession.title}</p>
                        <p className="text-sm text-gold-600">{formatTime(nextSession.startTime)} - {formatTime(nextSession.endTime)}</p>
                      </>
                    ) : (
                      <p className="font-medium text-black/70">None</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-maroon-900/80 font-medium text-lg">
                No session at this moment
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
                  Showing the next 3 upcoming events.
              </p>
            </div>

            {loading ? (
              <div className="text-center text-gray-500">Loading events...</div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    className="border border-black/25 bg-bg/50 p-2 md:p-3 lg:p-4 rounded-lg space-y-1"
                  >
                    <p className="text-maroon-900 font-semibold text-base md:text-lg lg:text-xl">
                      {event.title}
                    </p>
                    <p className="text-gold-600 font-medium text-sm md:text-base">
                      {formatDate(event.date)}
                    </p>
                    <p className="text-black/65 font-medium text-sm md:text-base">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
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
                Showing the last 3 finished events.
              </p>
            </div>

            {loading ? (
              <div className="text-center text-gray-500">Loading events...</div>
            ) : finishedEvents.length > 0 ? (
              <div className="space-y-4">
                {finishedEvents.map((event) => (
                  <div
                    key={event._id}
                    className="border border-black/25 bg-bg/50 p-2 md:p-3 lg:p-4 rounded-lg space-y-1"
                  >
                    <p className="text-maroon-900 font-semibold text-base md:text-lg lg:text-xl">
                      {event.title}
                    </p>
                    <p className="text-gold-600 font-medium text-sm md:text-base">
                      {formatDate(event.date)}
                    </p>
                    <p className="text-black/65 font-medium text-sm md:text-base">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
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
