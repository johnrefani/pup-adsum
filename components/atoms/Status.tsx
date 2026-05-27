import { StatusProps } from "@/lib/types"

const Status = ({status}: StatusProps) => {
  return (
    <div>
        {
            status === "present" ? (
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-green-500"></div>
                    <div className="text-base text-black font-medium">Present</div>
                </div>
            ):
            status === "timed-in" ? (
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-blue-500"></div>
                    <div className="text-base text-black font-medium">Timed-in</div>
                </div>
            ):
            status === "late" ? (
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-yellow-500"></div>
                    <div className="text-base text-black font-medium">Late</div>
                </div>
            ):
            status === "timed-in-late" ? (
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-yellow-500"></div>
                    <div className="text-base text-black font-medium">Timed-in Late</div>
                </div>
            ):
            status === "unfinished" ? (
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-orange-500"></div>
                    <div className="text-base text-black font-medium">Unfinished Attendance</div>
                </div>
            ):
            status === "late-unfinished" ? (
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-orange-500"></div>
                    <div className="text-base text-black font-medium">Late &amp; Unfinished Attendance</div>
                </div>
            ):
            status === "absent" ?
            (
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-maroon-500"></div>
                    <div className="text-base text-black font-medium">Absent</div>
                </div>
            ):(
                <div className="flex items-center justify-start gap-1">
                    <div className="rounded-full w-4 h-4 bg-gray-500"></div>
                    <div className="text-base text-black font-medium">Pending</div>
                </div>
            )
        }
    </div>
  )
}

export default Status
