"use client";

import { useState } from 'react';
import { Button } from '@/lib/imports';
import ScanSuccess from '@/components/scan/ScanSuccess';
import { SessionForClient } from '@/app/scan/[token]/page';
import { formatDisplayTime } from '@/lib/dateTimeFormat';

interface AttendanceResponse {
  success: boolean;
  action: 'time-in' | 'time-out';
  status: 'present' | 'absent' | 'unfinished' | 'late' | 'timed-in' | 'timed-in-late' | 'late-unfinished';
  timeIn: string;
  timeOut?: string;
}

interface Props {
  token: string;
  session: SessionForClient;
  user: { fullName: string };
  action: 'time-in' | 'time-out';
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (distance: number) => `${Math.round(distance)} meter${distance === 1 ? '' : 's'}`;

const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });

export default function ScanLocationConfirmation({ token, session, user, action }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOutsideRadius, setIsOutsideRadius] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<AttendanceResponse | null>(null);

  const requiresGeofence =
    session.venueLocation?.lat != null &&
    session.venueLocation?.lng != null &&
    session.allowedRadiusMeters != null &&
    session.allowedRadiusMeters > 0;

  const venueLabel = requiresGeofence
    ? `Venue coordinates: ${session.venueLocation?.lat.toFixed(6)}, ${session.venueLocation?.lng.toFixed(6)} (± ${session.allowedRadiusMeters} meters)`
    : 'No venue perimeter is configured for this session.';

  const handleConfirm = async () => {
    setIsLoading(true);
    setMessage('Checking your current location...');
    setIsOutsideRadius(false);
    setDistance(null);
    setCurrentLocation(null);

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      if (requiresGeofence && session.venueLocation) {
        const currentDistance = getDistance(latitude, longitude, session.venueLocation.lat, session.venueLocation.lng);

        if (currentDistance > session.allowedRadiusMeters!) {
          setCurrentLocation({ lat: latitude, lng: longitude });
          setDistance(currentDistance);
          setIsOutsideRadius(true);
          setMessage(`You are outside the allowed area. ${formatDistance(currentDistance)} away from the venue.`);
          setIsLoading(false);
          return;
        }
      }

      setMessage('Location confirmed. Recording attendance...');

      const response = await fetch(`/api/scan/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to record attendance');
      }

      setAttendanceResult(result as AttendanceResponse);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to confirm your location.');
    } finally {
      setIsLoading(false);
    }
  };

  if (attendanceResult) {
    return (
      <ScanSuccess
        session={session}
        user={user}
        status={attendanceResult.status}
        action={attendanceResult.action}
        timeIn={new Date(attendanceResult.timeIn)}
        timeOut={attendanceResult.timeOut ? new Date(attendanceResult.timeOut) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-center text-red-900">Confirm Venue</h1>
          <p className="text-sm text-gray-600 text-center mt-2">Please verify your location before {action === 'time-in' ? 'timing in' : 'timing out'}.</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-800">Session</p>
          <p className="text-base text-gray-900 mt-1">{session.title}</p>
          <p className="text-sm text-gray-600 mt-2">{formatDisplayTime(session.startTime)} - {formatDisplayTime(session.endTime)}</p>
          <p className="text-sm text-gray-600 mt-2">{venueLabel}</p>
        </div>

        {requiresGeofence && currentLocation && isOutsideRadius && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Current location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            <br />Distance from venue: {distance !== null ? formatDistance(distance) : 'Calculating...'}
          </div>
        )}

        {message && (
          <div className={`rounded-3xl p-4 text-center ${attendanceResult ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            text={isLoading ? 'Checking location…' : action === 'time-in' ? 'Confirm Venue & Time In' : 'Confirm Venue & Time Out'}
            onClick={handleConfirm}
            isDisabled={isLoading}
            textColor="text-white"
            backgroundColor="bg-maroon-800"
          />
          <p className="text-xs text-gray-500">
            If location access is denied, please allow GPS/location services and try again.
          </p>
        </div>
      </div>
    </div>
  );
}
