"use client"

import { CheckCircle } from '@/lib/icons';
import { SessionForClient } from '@/app/scan/[token]/page';
import { Button } from '@/lib/imports';
import { useRouter } from 'next/navigation';

interface Props {
  session: SessionForClient;
  timeIn: Date;
  user: { fullName: string };
}

export default function ScanSuccess({ session, timeIn, user }: Props) {
    const router = useRouter();
    
    const handleGoHome = () => {
    router.push('/'); 
  };


  const formattedTime = timeIn.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full text-center">
        <div className="mb-8">
          <CheckCircle className="w-28 h-28 mx-auto text-green-600" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
          Present!
        </h1>

        <p className="text-2xl font-semibold text-gray-800 mb-10">
          Welcome, {user.fullName}!
        </p>

        <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-8 border-2 border-green-200">
          <h2 className="text-2xl font-bold text-green-900 mb-6">{session.title}</h2>
          <div className="space-y-4 text-left text-gray-700">
            <p className="flex justify-between text-lg">
              <span className="font-medium">Date:</span>
              <span>{formattedDate}</span>
            </p>
            <p className="flex justify-between text-lg">
              <span className="font-medium">Time:</span>
              <span>{session.startTime} - {session.endTime}</span>
            </p>
            <p className="flex justify-between text-lg">
              <span className="font-medium">Time In:</span>
              <span className="font-bold text-green-700">{formattedTime}</span>
            </p>
            {session.description && (
              <p className="pt-4 border-t border-green-200">
                <span className="font-medium">Note:</span> {session.description}
              </p>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-lg">
          You have been successfully marked as <strong>PRESENT</strong>
        </p>

        <div className='mt-8 flex justify-center items-center'>
          <Button 
            text="Go Home"
            textColor='text-white'
            backgroundColor='bg-maroon-800'
            onClick={handleGoHome}
        />
        </div>
      </div>
    </div>
  );
}