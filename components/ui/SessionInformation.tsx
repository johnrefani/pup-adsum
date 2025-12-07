'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import InputField from '@/components/atoms/InputField';
import { SearchableSelectField } from '@/components/atoms/SearchableSelectField';
import { Button } from '@/lib/imports';

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();
  const selectedDept = watch("department");

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(d => setDepartments(d.departments || []))
      .catch(() => toast.error("Failed to load departments"));
  }, []);

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Generating QR Code...");

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to create session");

      toast.success("QR Code Generated Successfully!", { id: toastId });

      // THIS IS THE KEY: Dispatch correct data structure
      window.dispatchEvent(new CustomEvent('session-created', {
        detail: {
          qrImageUrl: result.qrImageUrl,
          session: result.session
        }
      }));

      reset(); // Clear form
    } catch (err: any) {
      toast.error(err.message || "Something went wrong", { id: toastId });
    }
  };

  if (mode !== 'create') {
    return <div className="text-center py-20 text-gray-500">Select a session to edit</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-2xl shadow-xl border p-8">
          <h2 className="text-3xl font-bold text-red-800 mb-8">Create New Session</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Session Title" placeholder="e.g. Web Programming" {...register('title', { required: 'Required' })} error={errors.title?.message} />
            <InputField label="Date" type="date" {...register('date', { required: 'Required' })} error={errors.date?.message} />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <InputField label="Start Time" type="time" {...register('startTime', { required: 'Required' })} error={errors.startTime?.message} />
            <InputField label="End Time" type="time" {...register('endTime', { required: 'Required' })} error={errors.endTime?.message} />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500" {...register('description')} />
          </div>

          <div className="mt-6">
            <SearchableSelectField
              label="Department"
              options={departments.map(d => ({ value: d._id, label: `${d.acronym} - ${d.name}` }))}
              value={selectedDept}
              onChange={(val) => setValue('department', val)}
              error={errors.department?.message}
            />
            <input type="hidden" {...register('department', { required: 'Department required' })} />
          </div>

          <div className="flex justify-end gap-4 mt-10">
            <Button type="button" text="Cancel" backgroundColor="bg-gray-500" textColor="text-white" onClick={() => reset()} />
            <Button type="submit" text="Generate QR Code" backgroundColor="bg-maroon-800" textColor="text-white" />
          </div>
        </div>
      </form>
    </>
  );
}