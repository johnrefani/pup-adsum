"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultPosition = { lat: 14.5995, lng: 121.0110 };

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  iconSize: [25, 41],
});

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number }) => void;
}

function MapClickHandler({ onChange }: { onChange: (location: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [position, setPosition] = useState(value ?? defaultPosition);
  const [inputLat, setInputLat] = useState((value?.lat ?? defaultPosition.lat).toString());
  const [inputLng, setInputLng] = useState((value?.lng ?? defaultPosition.lng).toString());
  const [inputError, setInputError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (value) {
      setPosition(value);
      setInputLat(value.lat.toString());
      setInputLng(value.lng.toString());
    }
  }, [value]);

  const handleSelect = (location: { lat: number; lng: number }) => {
    setPosition(location);
    setInputLat(location.lat.toString());
    setInputLng(location.lng.toString());
    setInputError('');
    onChange(location);
  };

  const handleManualInput = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);

    if (isNaN(lat) || isNaN(lng)) {
      setInputError('Please enter valid latitude and longitude values.');
      return;
    }

    if (lat < -90 || lat > 90) {
      setInputError('Latitude must be between -90 and 90.');
      return;
    }

    if (lng < -180 || lng > 180) {
      setInputError('Longitude must be between -180 and 180.');
      return;
    }

    const newLocation = { lat, lng };
    setPosition(newLocation);
    setInputError('');
    onChange(newLocation);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-800">Session Location</p>
            <p className="text-sm text-gray-600 mt-2">
              Set the venue location by clicking the map or entering coordinates from Google Maps.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            className="h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-red-900 hover:text-red-900 transition-colors"
          >
            ?
          </button>
        </div>
        {showHelp && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">Google Maps coordinate help</p>
            <ol className="list-decimal list-inside mt-3 space-y-2">
              <li>Open Google Maps and locate the venue.</li>
              <li>Right-click the exact spot and choose <span className="font-semibold">What's here?</span>.</li>
              <li>Copy the coordinates shown in the pop-up.</li>
              <li>Paste the latitude and longitude into the fields below, then click <span className="font-semibold">Set Location</span>.</li>
            </ol>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="h-[360px] rounded-3xl overflow-hidden border border-gray-200">
          <MapContainer
            center={position}
            zoom={16}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onChange={handleSelect} />
            <Marker position={position} icon={markerIcon} />
          </MapContainer>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="text"
              value={inputLat}
              onChange={(e) => {
                setInputLat(e.target.value);
                setInputError('');
              }}
              placeholder="e.g. 14.599500"
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-900"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="text"
              value={inputLng}
              onChange={(e) => {
                setInputLng(e.target.value);
                setInputError('');
              }}
              placeholder="e.g. 121.011000"
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-900"
            />
          </div>
        </div>

        {inputError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {inputError}
          </div>
        )}

        <button
          onClick={handleManualInput}
          className="w-full py-3 px-4 rounded-2xl bg-red-900 text-white font-semibold hover:bg-red-800 transition-colors"
        >
          Set Location
        </button>

      </div>
    </div>
  );
}