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

  if (todaySession) {
    const sessionName = todaySession.title;
    const start = formatDisplayTime(todaySession.startTime);
    const end = formatDisplayTime(todaySession.endTime);

    const now = new Date();
    const todayDate = now.toISOString().slice(0, 10);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startH, startM] = todaySession.startTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;

    const hasStarted = currentMinutes >= startMinutes;

    if (!hasStarted) {
      title = `The event ${sessionName} will start at ${start} until ${end}.`;
      subtitle = "Be sure to be present during the event!";
    } else if (todaySession.status === null) {
      title = `There is an event today! ${sessionName} that starts at ${start} until ${end}!`;
      subtitle = "Scan the QR code now to record your time-in.";
    } else if (todaySession.status === 'timed-in') {
      title = `You have timed in for ${sessionName}.`;
      subtitle = "Do not forget to scan again during the allowed time-out window.";
    } else if (todaySession.status === 'timed-in-late') {
      title = `You have timed in late for ${sessionName}.`;
      subtitle = "Scan again during the allowed time-out window so your attendance can be finalized as late.";
    } else if (todaySession.status === 'present') {
      title = `You completed your attendance for ${sessionName}.`;
      subtitle = "You were marked as present.";
    } else if (todaySession.status === 'late') {
      title = `You completed your attendance for ${sessionName}, but you were late.`;
      subtitle = "Your time-in was beyond the grace period.";
    } else if (todaySession.status === 'absent') {
      title = `You were marked as absent for ${sessionName}.`;
      subtitle = "You missed the allowed time-in window.";
    } else if (todaySession.status === 'unfinished') {
      title = `Your attendance for ${sessionName} is unfinished.`;
      subtitle = "You timed in but did not complete a valid time-out.";
    } else if (todaySession.status === 'late-unfinished') {
      title = `Your attendance for ${sessionName} is late and unfinished.`;
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
