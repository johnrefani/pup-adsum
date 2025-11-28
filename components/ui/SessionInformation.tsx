// File: SessionInformation.tsx
import React from 'react';
import { Button, InputField } from '@/lib/imports';    // Adjust path as needed 

export type SessionMode = 'create' | 'edit' | 'view';

interface SessionInformationProps {
  mode: SessionMode;
}

const SessionInformation: React.FC<SessionInformationProps> = ({ mode }) => {
  const isEditable = mode === 'create' || mode === 'edit';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-800">
            Session Information
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mt-1">
            {mode === 'create' && 'Enter details to generate QR code'}
            {mode === 'edit' && 'Update session information'}
            {mode === 'view' && 'Session details and QR code'}
          </p>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 space-y-10">
          {/* QR Code Placeholder - Shown in View & Edit modes */}
          {(mode === 'view' || mode === 'edit') && (
            <div className="flex justify-center">
              <div className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 bg-gray-100 border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gray-300 border-2 border-dashed border-gray-500 rounded-xl mb-4" />
                  <p className="text-gray-500 font-medium">QR Code Preview</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {mode === 'view' ? 'Generated QR will appear here' : 'Will be generated after saving'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-7">
            {/* Title & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Session Title"
                placeholder={isEditable ? "Enter session title" : ""}
                type="text"
                state={isEditable ? "editable" : "readonly"}
              />

              <InputField
                label="Session Date"
                type="date"
                state={isEditable ? "editable" : "readonly"}
              />
            </div>

            {/* Start & End Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Start Time"
                type="time"
                state={isEditable ? "editable" : "readonly"}
              />

              <InputField
                label="End Time"
                type="time"
                state={isEditable ? "editable" : "readonly"}
              />
            </div>

            {/* Session Description (kept as textarea as requested) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session Description
              </label>
              <textarea
                rows={3}
                placeholder={isEditable ? "Enter description" : ""}
                disabled={!isEditable}
                readOnly={!isEditable}
                className={`w-full px-4 py-3.5 rounded-xl border resize-none transition-all ${
                  isEditable
                    ? 'border-gray-300 focus:ring-2 focus:ring-red-600 bg-white placeholder-gray-400'
                    : 'border-gray-200 bg-gray-50 text-gray-800 cursor-default'
                }`}
              />
            </div>

            {/* Department */}
            <div>
              <InputField
                label="Department"
                placeholder={isEditable ? "Enter department" : ""}
                type="text"
                state={isEditable ? "editable" : "readonly"}
              />
            </div>
          </div>

          {/* Action Buttons - Using Your Custom Button Component */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8">
            {isEditable ? (
              <>
                <Button
                  text="Cancel"
                  textColor="text-white"
                  backgroundColor="bg-gray-500"
                  size="lg"
                />
                <Button
                  text={mode === 'create' ? 'Generate QR Code' : 'Update Information'}
                  textColor="text-white"
                  backgroundColor="bg-maroon-800"
                  size="lg"
                />
              </>
            ) : (
              <>
                <Button
                  text="Edit"
                  textColor="text-white"
                  backgroundColor="bg-amber-600"
                  size="lg"
                />
                <Button
                  text="Print QR"
                  textColor="text-black"
                  backgroundColor="bg-yellow-500"
                  size="lg"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionInformation;