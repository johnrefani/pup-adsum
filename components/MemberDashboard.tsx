"use client"

import { useEffect, useState } from "react";
import { MemberDashboardProps } from "@/lib/types"
import { Button } from "@/lib/imports";
import { formatDisplayDate, formatDisplayTime } from "@/lib/dateTimeFormat";
import { useRouter } from "next/navigation";

interface UpcomingEvent {
  _id: string;
  title: string;
  date: string; 
  startTime: string; 
  endTime: string; 
}

interface TodaySession {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "present" | "absent" | "unfinished" | "late" | "timed-in" | "timed-in-late" | "late-unfinished" | null;
}

const MemberDashboard = ({ username }: MemberDashboardProps) => {
  const router = useRouter();

  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [todaySession, setTodaySession] = useState<TodaySession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/user/dashboard');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUpcomingEvents(data.upcomingEvents || []);
        setTodaySession(data.todaySession || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  let title = "";
  let subtitle = "";
  let statusBadge = "";

  if (todaySession) {
    const sessionName = todaySession.title;
    const start = formatDisplayTime(todaySession.startTime);
    const end = formatDisplayTime(todaySession.endTime);

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const sessionDate = todaySession.date.split('T')[0];
    const sessionStart = new Date(`${sessionDate}T${todaySession.startTime}:00`);
    const hasStarted = now >= sessionStart;

    if (!hasStarted) {
      statusBadge = "Upcoming";
      title = `Upcoming event: ${sessionName}`;
      subtitle = `${formatDisplayDate(todaySession.date)} • ${start} - ${end}. Be ready to scan when the session starts.`;
    } else if (todaySession.status === null) {
      statusBadge = "Time-in Needed";
      title = `Time-in is open for ${sessionName}.`;
      subtitle = "Scan the QR code now to record your time-in.";
    } else if (todaySession.status === 'timed-in') {
      statusBadge = "Timed-in";
      title = `Time-in recorded for ${sessionName}.`;
      subtitle = "Scan again during the time-out window to complete your attendance as Present.";
    } else if (todaySession.status === 'timed-in-late') {
      statusBadge = "Timed-in Late";
      title = `Late time-in recorded for ${sessionName}.`;
      subtitle = "Scan again during the time-out window to complete your attendance as Late.";
    } else if (todaySession.status === 'present') {
      statusBadge = "Present";
      title = `Attendance completed for ${sessionName}.`;
      subtitle = "You successfully timed in and timed out.";
    } else if (todaySession.status === 'late') {
      statusBadge = "Late";
      title = `Attendance completed as Late for ${sessionName}.`;
      subtitle = "You timed in after the grace period and completed your time-out.";
    } else if (todaySession.status === 'absent') {
      statusBadge = "Absent";
      title = `Marked Absent for ${sessionName}.`;
      subtitle = "No valid time-in was completed within the allowed window.";
    } else if (todaySession.status === 'unfinished') {
      statusBadge = "Unfinished Attendance";
      title = `Attendance unfinished for ${sessionName}.`;
      subtitle = "You timed in but did not complete a valid time-out.";
    } else if (todaySession.status === 'late-unfinished') {
      statusBadge = "Late & Unfinished Attendance";
      title = `Late and unfinished attendance for ${sessionName}.`;
      subtitle = "You timed in late and did not complete a valid time-out.";
    }
  } else {
    title = "There is no event for today!";
    subtitle = "Have a great day!";
  }

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8">
      <div>
        <h1 className="font-bold text-xl md:text-2xl lg:text-[32px]">Welcome, {username}!</h1>
        <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">Overview of Dashboard</p>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          <div className="flex flex-col items-center text-center shadow-lg p-4 md:p-6 lg:p-8 bg-white rounded-lg space-y-1 md:space-y-2 lg:space-y-3">
            {statusBadge && (
              <span className="rounded-full border border-maroon-900/20 bg-maroon-50 px-3 py-1 text-sm font-semibold text-maroon-900">
                {statusBadge}
              </span>
            )}
            <h2 className="font-semibold text-maroon-900 text-2xl md:text-[28px] lg:text-[32px] max-w-full">
              {title}
            </h2>
            <p className="font-medium text-sm md:text-base lg:text-lg text-gold-600">
              {subtitle}
            </p>
          </div>

          {/* Shortcuts */}
          <div className="shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg space-y-4 md:space-y-6 lg:space-y-8">
            <div>
              <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">Quick Shortcuts</h2>
            </div>
            <div className="flex flex-wrap gap-1 md:gap-2 lg:gap-3">
              <Button
                textColor="text-white"
                text="My Attendance"
                backgroundColor="bg-maroon-900"
                onClick={() => router.push("/my-attendance")}
              />
              <Button
                textColor="text-gold-600"
                text="My Account"
                backgroundColor="bg-white border border-gold-600"
                onClick={() => router.push("/my-account")}
              />
            </div>
          </div>
        </div>

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
                    {formatDisplayDate(event.date)}
                  </p>
                  <p className="text-black/65 font-medium text-sm md:text-base">
                    {formatDisplayTime(event.startTime)} - {formatDisplayTime(event.endTime)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-black/60 font-medium">No upcoming events</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default MemberDashboard
