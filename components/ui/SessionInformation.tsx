'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, InputField, SearchableSelectField } from '@/lib/imports';
import { useSelectedSession } from '@/components/AdminSessions';

interface Department {
  _id: string;
  acronym: string;
  name: string;
}

interface FormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  department: string;
}

export default function SessionInformation({ mode }: { mode: 'create' | 'edit' | 'view' }) {
  const { selectedSession, setSelectedSession } = useSelectedSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();
  const selectedDept = watch("department");

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(d => setDepartments(d.departments || []))
      .catch(() => alert("Failed to load departments"));
  }, []);

  useEffect(() => {
    if (selectedSession) {
      reset({
        title: selectedSession.title,
        date: selectedSession.date,
        startTime: selectedSession.startTime,
        endTime: selectedSession.endTime,
        description: selectedSession.description,
        department: selectedSession.department,
      });
    } else {
      reset({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        department: ''
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

      reset({ title: '', date: '', startTime: '', endTime: '', description: '', department: '' });

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
        department: ''
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
      department: ''
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

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${selectedSession.title}</title>
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

              <div class="time">${selectedSession.startTime} – ${selectedSession.endTime}</div>

              ${selectedSession.description ? `<div class="small"><strong>Description:</strong> ${selectedSession.description}</div>` : ''}
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
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <form onSubmit={handleSubmit(mode === 'edit' ? onUpdate : onCreate)} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-2 md:gap-4 lg:gap-6">
            <InputField label="Session Title" placeholder="e.g. Web Programming"
              {...register('title', { required: 'Required' })} error={errors.title?.message} />
            <InputField label="Date" type="date"
              {...register('date', { required: 'Required' })} error={errors.date?.message} />
          </div>

          <div className="grid lg:grid-cols-2 gap-2 md:gap-4 lg:gap-6">
            <InputField label="Start Time" type="time" {...register('startTime', { required: 'Required' })} error={errors.startTime?.message} />
            <InputField label="End Time" type="time" {...register('endTime', { required: 'Required' })} error={errors.endTime?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500"
              {...register('description')} />
          </div>

          <div>
            <SearchableSelectField
              label="Department"
              options={departments.map(d => ({ value: d._id, label: `${d.acronym} - ${d.name}` }))}
              value={selectedDept}
              onChange={(val) => setValue('department', val)}
              error={errors.department?.message}
              disabled={mode === 'edit'}
            />
            <input type="hidden" {...register('department', { required: 'Department required' })} />
          </div>
        </form>
      </div>

      {/* Footer buttons - always visible */}
      <div className="px-8 py-6 border-t border-gray-200 flex justify-end gap-4">
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
    </div>
  );
}