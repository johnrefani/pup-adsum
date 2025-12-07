'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/lib/imports';
import Image from 'next/image';

interface QRData {
  qrImageUrl: string;
  session: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

export default function GeneratedQR() {
  const [qrData, setQrData] = useState<QRData | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent<QRData>) => {
      setQrData(e.detail);
    };

    window.addEventListener('session-created', handler as EventListener);
    return () => window.removeEventListener('session-created', handler as EventListener);
  }, []);

  if (!qrData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border p-12 text-center min-h-[500px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Fill the form and click "Generate QR Code"</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border p-10 text-center">
      <h1 className="text-3xl font-bold text-red-700 mb-10">QR Code Generated!</h1>

      <div className="inline-block p-8 bg-gray-50 rounded-3xl shadow-inner">
        <Image
          src={qrData.qrImageUrl}
          alt="Session QR Code"
          width={380}
          height={380}
          className="rounded-2xl shadow-lg"
          priority
        />
      </div>

      <div className="mt-10 space-y-3 text-left mx-auto bg-gray-50 p-6 rounded-xl">
        <p className="text-lg"><strong>Session:</strong> {qrData.session.title}</p>
        <p className="text-lg"><strong>Date:</strong> {new Date(qrData.session.date).toLocaleDateString()}</p>
        <p className="text-lg"><strong>Time:</strong> {qrData.session.startTime} - {qrData.session.endTime}</p>
      </div>

      <div className="mt-10">
        <Button
          text="Print QR Code"
          backgroundColor="bg-yellow-500"
          textColor="text-black"
          onClick={() => window.print()}
        />
      </div>
    </div>
  );
}