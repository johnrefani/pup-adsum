"use client"

import Scanner from './ui/Scanner';

const ScanQR = () => {

    const handleScanSuccess = (url: string) => {
    console.log('Scanned URL:', url);
    // Example: Navigate or open the URL
    window.open(url, '_blank');
    // Or redirect: router.push(url);
  };
  return (
    <section className='py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8'>
       <div>
            <h1 className="font-bold text-xl md:text-2xl lg:text-[32px] ">Scan QR</h1>
            <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">Place the QR Code within the view of camera.</p>
        </div>

        <div className='shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg'>
            <Scanner onScanSuccess={handleScanSuccess} />
        </div>
    </section>
  )
}

export default ScanQR