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

    const format12Hour = (time24: string): string => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) return time24;

    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${qrData.session.title}</title>
  <style>
    @page {
      size: auto;
      margin: 6mm 5mm;          /* tighter margins for more content */
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #1a1a1a;
      font-family: 'Segoe UI', system-ui, Arial, sans-serif;
    }

    .page {
      display: flex;
      justify-content: center;
      background: #ffffff;
    }

    .content-wrapper {
      width: 100%;
      max-width: 200mm;             /* wider usable area */
      padding: 0 8mm;
      text-align: center;
    }

    /* ── Main heading ── */
    h1 {
      font-size: clamp(2.1rem, 5.8vw, 2.7rem);
      font-weight: 800;
      margin: 0.2em 0 0.3em 0;
      color: #8B0000;
      letter-spacing: -0.4px;
      line-height: 1.05;
    }

    /* ── QR code ── */
    .qr-container {
      background: #ffffff;
      padding: 10px;
      border-radius: 8px;
      margin: 0 auto 1.4em;
      width: min(260px, 70%);
      aspect-ratio: 1 / 1;
      max-width: 260px;
      box-shadow: 0 3px 12px rgba(0,0,0,0.07);
      border: 1px solid #ddd;
    }

    .qr-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 5px;
    }

    /* ── Event info ── */
    .event-info {
      font-size: clamp(1.1rem, 3vw, 1.22rem);
      line-height: 1.5;
      color: #222;
    }

    .event-info .highlight {
      font-size: clamp(1.25rem, 3.4vw, 1.4rem);
      color: #000;
      font-weight: 700;
      margin: 0.4em 0 0.6em;
    }

    .event-info .date-time {
      font-size: clamp(1.2rem, 3.3vw, 1.32rem);
      font-weight: 700;
      color: #8B0000;
      margin: 0;
    }

    .event-info .time {
      margin-bottom: 0.2em;
    }

    .event-info .small {
      font-size: clamp(1rem, 2.7vw, 1.08rem);
      margin-top: 0.25em;
    }

    /* ── Instructions (now wider & rectangular) ── */
    .instructions {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: left;
      font-size: clamp(0.92rem, 2.45vw, 0.96rem);
      line-height: 1.55;
      border: 1px solid #e0e0e0;
      margin: 0.7em auto 0;
      max-width: 100%;                /* full available width */
    }

    .instructions h2 {
      font-size: clamp(1.35rem, 3.8vw, 1.55rem);
      color: #8B0000;
      margin: 0;
      text-align: center;
      font-weight: 700;
    }

    .instructions ol {
      margin: 0;
      padding-left: 1.7em;
    }

    .instructions li {
      margin-bottom: 0.35em;
    }

    .instructions li strong {
      color: #111;
    }

    .instructions .warning {
      color: #b22222;
      font-weight: 700;
      margin-top: 0.35em;
      display: block;
      text-align: center;
      font-size: clamp(0.96rem, 2.55vw, 1rem);
    }

    /* Print optimizations */
    @media print {
      .page {
        min-height: unset;
      }
      body {
        font-size: 9.5pt;   /* fallback base size for print */
      }
    }

    @media screen and (max-width: 600px) {
      .content-wrapper { padding: 0 6mm; }
      .qr-container { width: 200px; max-width: 85%; }
    }
  </style>
</head>
<body>

  <div class="page">
    <div class="content-wrapper">

      <h1>${qrData.session.title}</h1>

      <div class="qr-container">
        <img src="${qrData.qrImageUrl}" alt="QR Code" />
      </div>

      <div class="event-info">
        <div class="highlight">
          ${qrData.session.departmentLabel || 'N/A'}
        </div>

        <div class="date-time">
          ${new Date(qrData.session.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        <div class="time">${format12Hour(qrData.session.startTime)} – ${format12Hour(qrData.session.endTime)}</div>

        ${qrData.session.description ? `<div class="small"><strong>Description:</strong> ${qrData.session.description}</div>` : ''}
      </div>

      <!-- Instructions – now on same page, wider layout -->
      <div class="instructions">
        <h2>How to be marked as Present</h2>
        <ol>
          <li><strong>Scan the QR code</strong><br>Use your phone’s built-in QR scanner. (If unavailable, download a trusted QR scanner app from Google Play.)</li>
          <li><strong>Log in first</strong><br>Make sure you are logged in to your account before scanning.</li>
          <li><strong>Department check</strong><br>Only scan if you belong to the same department as the event.</li>
          <li><strong>Timing window</strong><br>
            • Scanning is only possible after the event has started and before it ends.<br>
            • Early or late scans will not work.
          </li>
          <li><strong>After scanning</strong><br>A link/URL will appear → tap it immediately to complete your time-in.</li>
        </ol>
        <span class="warning">Members who do not successfully scan during the event will be automatically marked absent once the event ends.</span>
      </div>

    </div>
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