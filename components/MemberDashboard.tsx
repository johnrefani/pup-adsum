"use client"

import { useEffect, useState } from "react";
import { MemberDashboardProps } from "@/lib/types"
import { Button } from "@/lib/imports";
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
  status: "present" | "absent" | null;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

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
    const start = formatTime(todaySession.startTime);
    const end = formatTime(todaySession.endTime);

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
      subtitle = "Scan the QR Code now to be marked as Present!";
    } else if (todaySession.status === 'present') {
      title = `You were marked as Present on the current event called ${sessionName} that starts at ${start} until ${end}!`;
      subtitle = "Have a great day!";
    } else if (todaySession.status === 'absent') {
      title = `You were marked as Absent on the recent event called ${sessionName} that starts at ${start} until ${end}!`;
      subtitle = "Be on time next time!";
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
      </div>
    </section>
  )
}

export default MemberDashboard