"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
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

function MapPositionUpdater({ position }: { position: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      map.invalidateSize();
      map.setView(position, map.getZoom());
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [map, position]);

  return null;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [position, setPosition] = useState(value ?? defaultPosition);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [inputError, setInputError] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (value) {
      setPosition(value);
    }
  }, [value]);

  const handleSelect = (location: { lat: number; lng: number }) => {
    setPosition(location);
    setInputError('');
    onChange(location);
  };

  const searchAddress = async (query: string) => {
    if (query.length < 3) return;

    setAddressLoading(true);
    setInputError('');
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '5',
        countrycodes: 'ph',
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const data = await res.json();
      const results = Array.isArray(data)
        ? data.map((item: any) => ({
            label: item.display_name as string,
            lat: Number(item.lat),
            lng: Number(item.lon),
          })).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
        : [];

      setAddressResults(results);
      if (results.length === 0) {
        setInputError('No matching address found.');
      }
    } catch (error) {
      setInputError('Unable to search address right now.');
      setAddressResults([]);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    const query = addressQuery.trim();
    if (query.length < 3) {
      setAddressResults([]);
      setInputError('');
      setAddressLoading(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      searchAddress(query);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [addressQuery]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-800">Session Location</p>
            <p className="text-sm text-gray-600 mt-2">
              Search an address or click the map to place the session venue marker.
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
              <li>Search the venue name or address.</li>
              <li>Select the closest result to move the marker.</li>
              <li>You can still click the map to fine-tune the exact venue spot.</li>
            </ol>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium text-gray-700">Search Address</label>
          <div className="relative mt-2">
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => {
                setAddressQuery(e.target.value);
                setInputError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              placeholder="Search venue or address..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-900"
            />
            {addressLoading && (
              <p className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                Searching...
              </p>
            )}
          </div>

          {addressResults.length > 0 && (
            <div className="mt-3 max-h-44 overflow-y-auto rounded-2xl border border-gray-200">
              {addressResults.map((result, index) => (
                <button
                  type="button"
                  key={`${result.lat}-${result.lng}-${index}`}
                  onClick={() => {
                    handleSelect({ lat: result.lat, lng: result.lng });
                    setAddressResults([]);
                    setAddressQuery(result.label);
                  }}
                  className="block w-full border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-700 transition-colors last:border-b-0 hover:bg-red-50"
                >
                  {result.label}
                </button>
              ))}
            </div>
          )}
        </div>

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
            <MapPositionUpdater position={position} />
            <Marker position={position} icon={markerIcon} />
          </MapContainer>
        </div>

        {inputError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {inputError}
          </div>
        )}
      </div>
    </div>
  );
}
