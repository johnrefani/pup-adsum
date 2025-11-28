'use client'; // Ensure client-side rendering for camera access

import React, { useEffect, useRef, useState } from 'react';

// Note: Install the dependency with `npm install html5-qrcode` or `yarn add html5-qrcode`
// This library provides cross-device QR scanning support via browser camera API.

interface ScannerProps {
  onScanSuccess?: (result: string) => void; // Callback for successful scan (e.g., handle URL)
  onScanError?: (error: string | Error) => void; // Optional error callback
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onScanError }) => {
  const readerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null); // Type 'any' for Html5Qrcode instance
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Import the library dynamically
  const [lib, setLib] = useState<any>(null);

  useEffect(() => {
    import('html5-qrcode').then(({ Html5Qrcode, Html5QrcodeSupportedFormats }) => {
      setLib({ Html5Qrcode, Html5QrcodeSupportedFormats });
    });

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    if (!lib || !lib.Html5Qrcode || !readerRef.current || isScanning) return;

    try {
      setError(null);
      const html5QrCode = new lib.Html5Qrcode(readerRef.current.id);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        formatsToSupport: [lib.Html5QrcodeSupportedFormats.QR_CODE], // Optimize for QR codes only
      };

      // Start with back camera (environment) on mobile
      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string, decodedResult: any) => {
          console.log(`QR Code scanned: ${decodedText}`, decodedResult);
          if (onScanSuccess) {
            onScanSuccess(decodedText);
          }
          // Auto-stop after successful scan
          html5QrCode.stop().then(() => {
            setIsScanning(false);
          }).catch(console.error);
        },
        (errorMessage: string) => {
          console.warn(`QR Scan Error:`, errorMessage);
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setError(err.message || 'Failed to initialize scanner. Please check camera permissions and try again.');
      if (onScanError) {
        onScanError(err);
      }
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current || !isScanning) return;

    try {
      await scannerRef.current.stop();
      setIsScanning(false);
      setError(null);
    } catch (err) {
      console.error('Failed to stop scanner:', err);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Mobile/Tablet Scanner - Visible only on screens smaller than lg (1024px) */}
      <div className="lg:hidden w-full">
        <div
          ref={readerRef}
          id="reader"
          className={`w-full h-64 sm:h-80 bg-white rounded-lg shadow-lg overflow-hidden relative transition-opacity ${isScanning ? 'opacity-100' : 'opacity-50'}`}
        >
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-500">📷</span>
                </div>
                <p className="text-gray-600 text-sm">Camera Preview</p>
              </div>
            </div>
          )}
          {/* Overlay for QR box guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-green-500 rounded-lg opacity-50 flex items-center justify-center bg-black bg-opacity-20">
              <span className="text-xs text-white font-semibold">Align QR Code Here</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        {/* Instructions text */}
        <p className="mt-4 text-center text-gray-900 text-sm sm:text-base">
          Position the QR code within the frame. Scanning works on mobile and tablet cameras.
        </p>

        {/* Control Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          {!isScanning ? (
            <button
              onClick={startScanner}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Start Scanner
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Stop Scanner
            </button>
          )}
        </div>
      </div>

      {/* Desktop Message - Visible only on lg (1024px) and larger */}
      <div className="hidden lg:flex flex-col items-center justify-center w-full">
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">QR Scanner</h2>
            <p className="text-gray-900 text-lg">Please use a mobile phone or tablet to scan QR codes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;