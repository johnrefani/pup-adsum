import { StatusProps } from "@/lib/types"

const Status = ({isPresent}: StatusProps) => {
  return (
    <div>
        {
            isPresent ? (
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-green-500"></div>
                    <div className="text-base text-black font-medium">Present</div>
                </div>
            ):(
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-maroon-500"></div>
                    <div className="text-base text-black font-medium">Absent</div>
                </div>
            )
        }
    </div>
  )
}

export default Status