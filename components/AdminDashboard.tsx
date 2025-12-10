"use client"

import { AdminDashboardProps } from "@/lib/types"
import { Button, CountStat } from "@/lib/imports";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TodaySession {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  presentCount: number;
  absentCount: number;
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
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/my-sessions');
        const data = await res.json();

        if (!res.ok || !data.sessions) {
          setTodaySession(null);
          setUpcomingEvents([]);
          setLoading(false);
          return;
        }

        const sessions = data.sessions as any[];
        const today = new Date().toISOString().split('T')[0];

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const futureAndToday = sessions.filter((s: any) => {
          const eventDate = new Date(s.date);
          return eventDate >= now;
        });

        futureAndToday.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const todayEventRaw = futureAndToday.find((s: any) => s.date === today);

        if (todayEventRaw) {
          const attRes = await fetch(`/api/admin/attendance-records?sessionId=${todayEventRaw._id}`);
          const attData = await attRes.json();

          const students = attData.students || [];
          const presentCount = students.filter((s: any) => s.status === 'present').length;
          const absentCount = students.filter((s: any) => s.status === 'absent').length;

          setTodaySession({
            _id: todayEventRaw._id,
            title: todayEventRaw.title,
            date: todayEventRaw.date,
            startTime: todayEventRaw.startTime,
            endTime: todayEventRaw.endTime,
            presentCount,
            absentCount,
          });
        } else {
          setTodaySession(null);
        }

        const upcoming = futureAndToday
          .filter((s: any) => s.date > today) 
          .slice(0, 3)
          .map((s: any) => ({
            _id: s._id,
            title: s.title,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
          }));

        setUpcomingEvents(upcoming);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setTodaySession(null);
        setUpcomingEvents([]);
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
                <div className="flex justify-center gap-4 md:gap-6 lg:gap-8">
                  <CountStat count={todaySession.presentCount.toString()} ringColor="border-gold-600" textColor="text-maroon-900" text="Present"/>
                  <CountStat count={todaySession.absentCount.toString()} ringColor="border-maroon-900" textColor="text-gold-600" text="Absent"/>
                </div>
                <div className="text-lg md:text-xl lg:text-2xl text-maroon-900 font-bold text-center">
                  {todaySession.title}
                  <p className="text-sm md:text-base lg:text-lg text-gold-600 font-medium">
                    {formatTime(todaySession.startTime)} - {formatTime(todaySession.endTime)}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center text-maroon-900/80 font-medium text-lg">
                There are no events for today
              </div>
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

export default AdminDashboard