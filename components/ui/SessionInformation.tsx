'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, InputField, SearchableSelectField } from '@/lib/imports';
import { useSelectedSession } from '@/components/AdminSessions';


interface FormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export default function SessionInformation({ mode }: { mode: 'create' | 'edit' | 'view' }) {
  const { selectedSession, setSelectedSession } = useSelectedSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();


  useEffect(() => {
    if (selectedSession) {
      reset({
        title: selectedSession.title,
        date: selectedSession.date,
        startTime: selectedSession.startTime,
        endTime: selectedSession.endTime,
        description: selectedSession.description,
      });
    } else {
      reset({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
      });
    }
  }, [selectedSession, reset]);

  const onCreate = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");

      reset({ title: '', date: '', startTime: '', endTime: '', description: ''});

      window.dispatchEvent(new CustomEvent('session-created', {
        detail: { qrImageUrl: result.qrImageUrl, session: result.session }
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdate = async (data: FormData) => {
    if (!selectedSession) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession._id,
          ...data,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");

      alert("Session updated successfully!");
      setSelectedSession(null);
      reset({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
      });
      window.dispatchEvent(new Event('session-updated'));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    reset({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
    });
    setSelectedSession(null);
  };

  const handlePrint = () => {
    if (!selectedSession) return;

    const printWindow = window.open('', '', `width=800,height=600,left=${(screen.availWidth - 800) / 2},top=${(screen.availHeight - 600) / 2},scrollbars=no,resizable=yes`);
    if (!printWindow) {
      alert("Please allow popups to print the QR code");
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
  <title>${selectedSession.title}</title>
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

      <h1>${selectedSession.title}</h1>

      <div class="qr-container">
        <img src="${selectedSession.qrImageUrl}" alt="QR Code" />
      </div>

      <div class="event-info">
        <div class="highlight">
          ${selectedSession.departmentLabel || 'N/A'}
        </div>

        <div class="date-time">
          ${new Date(selectedSession.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        <div class="time">${format12Hour(selectedSession.startTime)} – ${format12Hour(selectedSession.endTime)}</div>

        ${selectedSession.description ? `<div class="small"><strong>Description:</strong> ${selectedSession.description}</div>` : ''}
      </div>

      <!-- Instructions – now on same page, wider layout -->
      <div class="instructions">
        <h2>How to be marked as Present</h2>
        <ol>
          <li><strong>Scan the QR code</strong><br>Use your phone’s built-in QR scanner. (If unavailable, download a trusted QR scanner app from Google Play.)</li>
          <li><strong>Log in first</strong><br>Make sure you are logged in to your account before scanning.</li>
          <li><strong>Organization check</strong><br>Only scan if you belong to the same organization as the event.</li>
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
      const triggerPrint = () => {
        printWindow.focus();
        printWindow.print();
      };

      if (img.complete && img.naturalWidth > 0) {
        triggerPrint();
      } else {
        img.onload = triggerPrint;
        img.onerror = triggerPrint;
      }
    }
  };

  const isEdit = mode === 'edit';

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col max-h-[90vh] lg:max-h-[75vh]">
      {/* Header - always visible */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-200">
        <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-red-800">
          {mode === 'edit' ? 'Edit Session' : 'Create New Session'}
        </h2>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 px-8 py-6">
        <form onSubmit={handleSubmit(mode === 'edit' ? onUpdate : onCreate)} className="space-y-6">
          <div className='overflow-y-auto max-h-[50vh] md:max-h-[45vh] lg:max-h-auto'>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Session Title" placeholder="e.g. Web Programming"
              {...register('title', { required: 'Required' })} error={errors.title?.message} />
            <InputField label="Date" type="date"
              {...register('date', { required: 'Required' })} error={errors.date?.message} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Start Time" type="time" {...register('startTime', { required: 'Required' })} error={errors.startTime?.message} />
            <InputField label="End Time" type="time" {...register('endTime', { required: 'Required' })} error={errors.endTime?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500"
              {...register('description')} />
          </div>
          </div>

          {/* Footer buttons - always visible */}
      <div className="py-6 border-t border-gray-200 flex justify-end gap-4">
        <Button
          type="button"
          text="Clear"
          backgroundColor="bg-gray-500"
          textColor="text-white"
          onClick={handleClear}
          isDisabled={isSubmitting}
        />
        {mode === 'edit' && selectedSession && (
          <Button
            type="button"
            text="Print QR"
            backgroundColor="bg-yellow-500"
            textColor="text-white"
            onClick={handlePrint}
            isDisabled={isSubmitting}
          />
        )}
        <Button
          type="submit"
          text={isSubmitting ? "Saving..." : (mode === 'edit' ? "Update Session" : "Generate QR Code")}
          backgroundColor="bg-maroon-800"
          textColor="text-white"
          isDisabled={isSubmitting || (mode === 'edit' && !selectedSession)}
        />
      </div>
        </form>
      </div>

      
    </div>
  );
}