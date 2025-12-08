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
    description?: string;
    departmentLabel?: string;
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

  const handlePrint = () => {
    if (!qrData) return;

    const printWindow = window.open('', '', `width=800,height=600,left=${(screen.availWidth - 800) / 2},top=${(screen.availHeight - 600) / 2},scrollbars=yes,resizable=yes`);
    if (!printWindow) {
      alert("Please allow popups for printing");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR: ${qrData.session.title}</title>
          <style>
            body { font-family: 'Poppins', sans-serif; text-align: center; padding: 20px; }
            img { width: 500px; margin: 20px auto; display: block; }
            h2 { font-size: 64px; margin: 20px 0; color: #8B0000; }
            .info { font-size: 32px; line-height: 1.6; }
            .info strong { color: #333; }
          </style>
        </head>
        <body>
          <img src="${qrData.qrImageUrl}" alt="QR Code" />
          <h2>${qrData.session.title}</h2>
          <div class="info">
            <p><strong>Department:</strong> ${qrData.session.departmentLabel || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(qrData.session.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${qrData.session.startTime} - ${qrData.session.endTime}</p>
            <p><strong>Description:</strong> ${qrData.session.description || 'N/A'}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // Optional: close window after printing
    // printWindow.close();
  };

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

      <div className="mt-10 space-y-3 text-left max-w-2xl mx-auto bg-gray-50 p-6 rounded-xl">
        <p className="text-lg"><strong>Session:</strong> {qrData.session.title}</p>
        <p className="text-lg"><strong>Date:</strong> {new Date(qrData.session.date).toLocaleDateString()}</p>
        <p className="text-lg"><strong>Time:</strong> {qrData.session.startTime} - {qrData.session.endTime}</p>
        <p className="text-lg"><strong>Description:</strong> {qrData.session.description || 'N/A'}</p>
        <p className="text-lg"><strong>Department:</strong> {qrData.session.departmentLabel || 'N/A'}</p>
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button
          text="Print QR Code"
          backgroundColor="bg-yellow-500"
          textColor="text-white"
          onClick={handlePrint}
        />
      </div>
    </div>
  );
}