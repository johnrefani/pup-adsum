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
      <html>
        <head>
          <title>${selectedSession.title}</title>
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
          <img src="${selectedSession.qrImageUrl}" class="qr" alt="QR Code" />
          <h1>${selectedSession.title}</h1>
          <div class="details">
            <p><strong>Department:</strong> ${selectedSession.departmentLabel || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(selectedSession.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Time:</strong> ${selectedSession.startTime} – ${selectedSession.endTime}</p>
            ${selectedSession.description ? `<p><strong>Description:</strong> ${selectedSession.description}</p>` : ''}
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