import { StudentFilter, StudentList } from "@/lib/imports";

const AttendanceRecords = () => {
  return (
    <section className="py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8">
        <div>
            <h1 className="font-bold text-xl md:text-2xl lg:text-[32px] ">Welcome</h1>
            <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">Overview of Dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <StudentFilter />
            <StudentList />
        </div>
        
    </section>
  )
}

export default AttendanceRecords