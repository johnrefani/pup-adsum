
import { CountStatProps } from "@/lib/types"

const CountStat = ({count, ringColor, textColor, text}: CountStatProps) => {
  return (
    <div className={`flex-center text-center rounded-full bg-white w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 border-8 md:border-9 lg:border-10 ${ringColor}`}>
        <div className="gap-1 md:gap-1.5 lg:gap-2">
            <p className="text-xs md:text-sm lg:text-base font-medium text-slate-500">{text}</p>
            <p className={`${textColor} text-2xl md:text-3xl lg:text-4xl font-bold`}>{count}</p>
        </div>   
    </div>
  )
}

export default CountStat