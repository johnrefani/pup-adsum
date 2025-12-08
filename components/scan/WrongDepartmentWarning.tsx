"use client";

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/lib/imports';
import { useRouter } from 'next/navigation';

export default function WrongDepartmentWarning({
  sessionTitle,
  sessionDept,
  userDept,
}: {
  sessionTitle: string;
  sessionDept: string;
  userDept: string;
}) {

    const router = useRouter();
    
    const handleGoHome = () => {
    router.push('/'); 
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full text-center">
        <AlertTriangle className="w-28 h-28 mx-auto text-red-600 mb-8" />

        <h1 className="text-4xl md:text-5xl font-bold text-red-800 mb-6">
          Access Denied
        </h1>

        <p className="text-xl text-gray-700 mb-8">
          You cannot attend this session.
        </p>

        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-red-900 mb-6">{sessionTitle}</h2>
          
          <div className="space-y-4 text-left">
            <p className="text-lg">
              <span className="font-semibold">Session for:</span>{' '}
              <span className="text-red-700 font-bold">{sessionDept}</span>
            </p>
            <p className="text-lg">
              <span className="font-semibold">You belong to:</span>{' '}
              <span className="text-red-700 font-bold">{userDept}</span>
            </p>
          </div>
        </div>

        <div className="place-self-center mt-8 ">
        <Button 
            text="Go Home"
            textColor='text-white'
            backgroundColor='bg-maroon-800 '
            onClick={handleGoHome}
        />
        </div>
      </div>
    </div>
  );
}