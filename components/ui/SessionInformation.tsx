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

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Print QR</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<img src="${selectedSession.qrImageUrl}" style="width:300px;"/>`);
    printWindow.document.write(`<h2>${selectedSession.title}</h2>`);
    printWindow.document.write(`<p>Date: ${new Date(selectedSession.date).toLocaleDateString()}</p>`);
    printWindow.document.write(`<p>Time: ${selectedSession.startTime} - ${selectedSession.endTime}</p>`);
    printWindow.document.write(`<p>Description: ${selectedSession.description || 'N/A'}</p>`);
    printWindow.document.write(`<p>Department: ${selectedSession.departmentLabel}</p>`);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.print();
  };

  const isEdit = mode === 'edit';

  return (
    <form onSubmit={handleSubmit(isEdit ? onUpdate : onCreate)} className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl border p-8">
        <h2 className="text-3xl font-bold text-red-800 mb-8">
          {isEdit ? 'Edit Session' : 'Create New Session'}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="Session Title" placeholder="e.g. Web Programming"
            {...register('title', { required: 'Required' })} error={errors.title?.message} />
          <InputField label="Date" type="date"
            {...register('date', { required: 'Required' })} error={errors.date?.message} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <InputField label="Start Time" type="time"
            {...register('startTime', { required: 'Required' })} error={errors.startTime?.message} />
          <InputField label="End Time" type="time"
            {...register('endTime', { required: 'Required' })} error={errors.endTime?.message} />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
          <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500"
            {...register('description')} />
        </div>

        <div className="mt-6">
          <SearchableSelectField
            label="Department"
            options={departments.map(d => ({ value: d._id, label: `${d.acronym} - ${d.name}` }))}
            value={selectedDept}
            onChange={(val) => setValue('department', val)}
            error={errors.department?.message}
            disabled={isEdit}
          />
          <input type="hidden" {...register('department', { required: 'Department required' })} />
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <Button
            type="button"
            text="Clear"
            backgroundColor="bg-gray-500"
            textColor="text-white"
            onClick={handleClear}
            isDisabled={isSubmitting}
          />
          {isEdit && selectedSession && (
            <Button
              type="button"
              text="Print QR"
              backgroundColor="bg-yellow-500"
              textColor="text-black"
              onClick={handlePrint}
              isDisabled={isSubmitting}
            />
          )}
          <Button
            type="submit"
            text={isSubmitting ? "Saving..." : (isEdit ? "Update Session" : "Generate QR Code")}
            backgroundColor="bg-maroon-800"
            textColor="text-white"
            isDisabled={isSubmitting || (isEdit && !selectedSession)}
          />
        </div>
      </div>
    </form>
  );
}