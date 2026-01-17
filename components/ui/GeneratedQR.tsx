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
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${qrData.session.title}</title>
        <style>
          @page {
            size: auto;                     /* ← key change: respect user's chosen paper size */
            margin: 15mm 12mm;              /* still reasonable default margins */
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
            min-height: 100vh;              /* screen preview */
            display: flex;
            justify-content: center;        /* horizontal center */
            align-items: center;            /* vertical center */
            page-break-after: always;
            background: #ffffff;
          }

          .content-wrapper {
            width: 100%;
            max-width: 190mm;               /* safe for A4 ~186–190 mm usable, also fine on Letter */
            text-align: center;
            padding: 0 10mm;
          }

          /* ── Page 1: Event + QR ── */
          h1 {
            font-size: clamp(2.4rem, 7vw, 3.2rem);
            font-weight: 800;
            margin: 0 0 1.8em 0;
            color: #8B0000;
            letter-spacing: -0.5px;
            line-height: 1.1;
          }

          .qr-container {
            background: #ffffff;
            padding: 14px;
            border-radius: 10px;
            margin: 0 auto 2.2em;
            width: min(320px, 85%);
            aspect-ratio: 1 / 1;            /* keep square even if width adjusts */
            max-width: 320px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            border: 1px solid #ddd;
          }

          .qr-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 6px;
          }

          .event-info {
            font-size: clamp(1.25rem, 3.5vw, 1.4rem);
            line-height: 1.55;
            color: #333;
          }

          .event-info .highlight {
            font-size: clamp(1.4rem, 4vw, 1.65rem);
            color: #000;
            font-weight: 700;
            margin-bottom: 0.9em;
          }

          .event-info .date-time {
            font-size: clamp(1.35rem, 4vw, 1.55rem);
            font-weight: 700;
            color: #8B0000;
            margin: 1.1em 0 0.5em;
          }

          .event-info .time {
            margin-bottom: 0.6em;
          }

          .event-info .small {
            font-size: clamp(1.15rem, 3vw, 1.28rem);
            margin-top: 0.8em;
          }

          /* ── Page 2: Instructions ── */
          .instructions {
            background: #f9f9f9;
            border-radius: 10px;
            padding: clamp(20px, 5vw, 32px) clamp(16px, 4vw, 28px);
            text-align: left;
            font-size: clamp(1.05rem, 3vw, 1.16rem);
            line-height: 1.65;
            border: 1px solid #e0e0e0;
            max-width: 190mm;
            margin: 0 auto;
          }

          .instructions h2 {
            font-size: clamp(1.6rem, 4.5vw, 1.9rem);
            color: #8B0000;
            margin: 0 0 1.4em 0;
            text-align: center;
            font-weight: 700;
          }

          .instructions ol {
            margin: 0 0 1em 0;
            padding-left: 1.9em;
          }

          .instructions li {
            margin-bottom: 0.8em;
          }

          .instructions li strong {
            color: #111;
          }

          .instructions .warning {
            color: #b22222;
            font-weight: 700;
            margin-top: 1.5em;
            display: block;
            text-align: center;
            font-size: clamp(1.1rem, 3vw, 1.22rem);
          }

          /* Screen preview helpers */
          @media screen {
            .page {
              min-height: 80vh;
              margin-bottom: 3rem;
              overflow: hidden;
            }
          }

          @media print {
            .page {
              min-height: unset;
              height: auto;
            }
          }

          @media (max-width: 600px) {
            .content-wrapper { padding: 0 8mm; }
            .qr-container { width: 280px; max-width: 90%; }
          }
        </style>
      </head>
      <body>

        <!-- Page 1 -->
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

              <div class="time">${qrData.session.startTime} – ${qrData.session.endTime}</div>

              ${qrData.session.description ? `<div class="small"><strong>Description:</strong> ${qrData.session.description}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Page 2 -->
        <div class="page">
          <div class="content-wrapper">
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