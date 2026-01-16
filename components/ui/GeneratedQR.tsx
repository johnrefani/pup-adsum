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

    const printWindow = window.open('', '', `width=800,height=600,left=${(screen.availWidth - 800) / 2},top=${(screen.availHeight - 600) / 2},scrollbars=no,resizable=yes`);
    if (!printWindow) {
      alert("Please allow popups for printing");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${qrData.session.title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: white;
              color: #222;
            }
            .qr { 
              width: 420px; 
              height: 420px; 
              margin: 20px 0;
              padding: 20px;
              background: white;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            h1 {
              font-size: 36px;
              margin: 10px 0;
              color: #8B0000;
            }
            .details {
              font-size: 24px;
              line-height: 1.8;
              text-align: center;
              max-width: 600px;
            }
            .details strong { color: #333; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <img src="${qrData.qrImageUrl}" class="qr" alt="QR Code" />
          <h1>${qrData.session.title}</h1>
          <div class="details">
            <p><strong>Department:</strong> ${qrData.session.departmentLabel || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(qrData.session.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Time:</strong> ${qrData.session.startTime} – ${qrData.session.endTime}</p>
            ${qrData.session.description ? `<p><strong>Description:</strong> ${qrData.session.description}</p>` : ''}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    const img = printWindow.document.querySelector('img');
    if (img) {
      if (img.complete && img.naturalWidth > 0) {
        printWindow.focus();
        printWindow.print();
      } else {
        img.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
    } else {
      printWindow.focus();
      printWindow.print();
    }
  };

  if (!qrData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center min-h-[200px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Fill the form and click "Generate QR Code"</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-h-[90vh] lg:max-h-[75vh] overflow-y-auto">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-700 mb-4 whitespace-nowrap">QR Code Generated!</h1>

      <div className="inline-block p-4 bg-gray-50 rounded-3xl shadow-inner">
        <Image
          src={qrData.qrImageUrl}
          alt="Session QR Code"
          width={380}
          height={380}
          className="rounded-2xl shadow-lg"
          priority
        />
      </div>

      <div className="space-y-3 text-left max-w-2xl mx-auto  p-6 rounded-xl">
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