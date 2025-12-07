"use client";


import { AlertCircle } from 'lucide-react';
import { SessionForClient } from '@/app/scan/[token]/page';
import { Button } from '@/lib/imports';
import { useRouter } from 'next/navigation';

interface Props {
  session: SessionForClient;
  timeIn: Date;
}

export default function ScanAlreadyPresent({ session, timeIn }: Props) {
  const router = useRouter();
    
    const handleGoHome = () => {
    router.push('/'); 
  };

  const formattedTime = new Date(timeIn).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full text-center">
        <div className="mb-8">
          <AlertCircle className="w-28 h-28 mx-auto text-amber-600" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-6">
          Already Present
        </h1>

        <p className="text-xl text-gray-700 mb-10">
          You have already scanned this session.
        </p>

        <div className="bg-amber-50 rounded-2xl p-8 border-2 border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">{session.title}</h2>
          <p className="text-lg text-gray-700">
            <strong>Time In:</strong> {formattedTime}
          </p>
        </div>

        <div className="place-self-center mt-8">
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