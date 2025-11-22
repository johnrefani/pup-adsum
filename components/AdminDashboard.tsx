"use client"

import { AdminDashboardProps } from "@/lib/types"
import { Button, CountStat } from "@/lib/imports";
import { useRouter } from "next/navigation";



const AdminDashboard = ({username}: AdminDashboardProps) => {
  const router = useRouter();

  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8">
        <div>
            <h1 className="font-bold text-xl md:text-2xl lg:text-[32px] ">Welcome, {username}!</h1>
            <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">Overview of Dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg space-y-4 md:space-y-6 lg:space-y-8">
              <div>
                <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">Current Attendance Overview</h2>
                <p className="font-medium text-xs md:text-sm lg:text-base text-gold-600">October 27, 2025</p>
              </div>
              <div className="flex-center gap-4 md:gap-6 lg:gap-8">
                <CountStat count="45" ringColor="border-gold-600" textColor="text-maroon-900" text="Present"/>
                <CountStat count="3" ringColor="border-maroon-900" textColor="text-gold-600" text="Absent"/>
              </div>
            </div>
            <div>
              <div className="shadow-lg p-4 md:p-5 lg:p-6 bg-white rounded-lg space-y-4 md:space-y-6 lg:space-y-8">
              <div>
                <h2 className="font-semibold text-maroon-900 text-base md:text-lg lg:text-xl">Quick Shortcuts</h2>
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2 lg:gap-3">
                <Button 
                  textColor="text-white"
                  text="Generate QR"
                  backgroundColor="bg-maroon-900"
                  onClick={() => {
                    router.push("/sessions")
                  }}
                />
                <Button 
                  textColor="text-gold-600"
                  text="View Reports"
                  backgroundColor="bg-white border border-gold-600"
                  onClick={() => {
                    router.push("/attendance-records")
                  }}
                />
                <Button 
                  textColor="text-gold-600"
                  text="Add New Member"
                  backgroundColor="bg-white border border-gold-600"
                  onClick={() => {
                    router.push("/user-management")
                  }}
                />
              </div>
            </div>
            </div>
        </div>
        
    </section>
  )
}

export default AdminDashboard