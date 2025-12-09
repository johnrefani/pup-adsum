"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/lib/imports";


export default function InvalidQRMessage({ message, token }: { message: string; token?: string }) {

      const router = useRouter();
    
    const handleGoHome = () => {
    router.push('/'); 
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-800 mb-4">Invalid QR Code</h1>
        <p className="text-gray-600 text-lg mb-4">{message}</p>
        {token && (
          <code className="block text-xs bg-gray-100 px-4 py-3 rounded-lg font-mono break-all mt-6">
            {token}
          </code>
        )}
      </div>
      <div className="mt-8 flex justify-center items-center">
        <Button 
            text="Go Home"
            textColor='text-white'
            backgroundColor='bg-maroon-800'
            onClick={handleGoHome}
        />
      </div>
    </div>
  );
}