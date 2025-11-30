"use client"

import { MemberDashboardProps } from "@/lib/types"
import { Button } from "@/lib/imports";
import { useRouter } from "next/navigation";


const MemberDashboard = ({username}: MemberDashboardProps) => {
  const router = useRouter();

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8">
        <div>
            <h1 className="font-bold text-xl md:text-2xl lg:text-[32px] ">Welcome, {username}!</h1>
            <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">Overview of Dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="flex-col items-center text-center shadow-lg p-4 md:p-6 lg:p-8 bg-white rounded-lg space-y-1 md:space-y-2 lg:space-y-3">
                <h2 className="font-semibold text-maroon-900 text-2xl md:text-[28px] lg:text-[32px] w-full lg:max-w-3/4 place-self-center">You are marked present on November 22, 2025</h2>
                <p className="font-medium text-sm md:text-base lg:text-lg text-gold-600">Have a great day!</p>
            </div>
            <div>
              <div className="shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg space-y-4 md:space-y-6 lg:space-y-8">
              <div>
                <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">Quick Shortcuts</h2>
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2 lg:gap-3">
                <Button 
                  textColor="text-white"
                  text="My Attendance"
                  backgroundColor="bg-maroon-900"
                  onClick={() => {
                    router.push("/my-attendance")
                  }}
                />
                <Button 
                  textColor="text-gold-600"
                  text="My Account"
                  backgroundColor="bg-white border border-gold-600"
                  onClick={() => {
                    router.push("/my-account")
                  }}
                />
              </div>
            </div>
            </div>
        </div>
        
    </section>
  )
}

export default MemberDashboard