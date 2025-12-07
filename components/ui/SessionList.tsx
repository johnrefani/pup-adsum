import React from 'react';

const SessionList: React.FC = () => {
  // Dummy data — purely front-end
  const sessions = [
    {
      id: 1,
      name: 'Event 3',
      date: 'November 3, 2025',
      time: '3:00PM/5:00PM',
    },
    {
      id: 2,
      name: 'Event 2',
      date: 'November 2, 2025',
      time: '8:00AM/10:00AM',
    },
    {
      id: 3,
      name: 'Event 1',
      date: 'November 1, 2025',
      time: '1:00PM/3:00PM',
    },
  ];

  return (
    <div className="">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-5 md:px-6 md:py-5 ">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-red-800">
            Session List
          </h2>
          <p className="text-sm text-amber-600 mt-1">
            Select and manage sessions.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Session Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Start/End Time
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                >
                  {/* Session Name + Mobile Date */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm md:text-base lg:text-lg font-medium text-gray-900">
                        {session.name}
                      </span>
                      <span className="text-sm text-gray-500 sm:hidden">
                        {session.date}
                      </span>
                    </div>
                  </td>

                  {/* Date - Hidden on mobile */}
                  <td className="text-sm md:text-base lg:text-lg px-6 py-5 text-gray-700 hidden sm:table-cell">
                    {session.date}
                  </td>

                  {/* Time */}
                  <td className="text-sm md:text-base lg:text-lg px-6 py-5 text-gray-700 font-medium">
                    {session.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Optional: Empty state (uncomment if needed) */}
        {/* {sessions.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No sessions found.
          </div>
        )} */}
      </div>
    </div>
  );
};

export default SessionList;