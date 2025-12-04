import { Button } from "@/lib/imports"

const GeneratedQr = () => {
  return (
    <div className="w-full">
       <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-10 lg:p-12 text-center">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-red-700 mb-8 lg:mb-12">
      Generated QR Code
    </h1>

    <div className="mx-auto w-[200px] h-[200px] border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
      <p className="text-gray-400 text-sm">QR Code appears here</p>
    </div>

    <p className="mt-8 lg:mt-12 text-base sm:text-lg lg:text-xl font-medium text-amber-600">
      The session is saved.
    </p>
    <div className="hidden lg:flex flex-col sm:flex-row gap-4 justify-end pt-8">
        <Button
            text="Print QR"
            textColor="text-black"
            backgroundColor="bg-yellow-500"
        />
    </div>
    
  </div>
    </div>
  )
}

export default GeneratedQr