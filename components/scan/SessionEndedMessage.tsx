"use client";
import { Button } from '@/lib/imports';
import { useRouter } from 'next/navigation';

export interface SessionForClient {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  departmentName?: string;
}


export default function SessionEndedMessage({ session }: { session: SessionForClient }) {

    const router = useRouter();
    
    const handleGoHome = () => {
    router.push('/'); 
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-300 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Session Ended</h1>
        <p className="text-lg text-gray-600">
          This session ended at <strong>{session.endTime}</strong> on{' '}
          {new Date(session.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <div className=" flex justify-center items-center mt-8">
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