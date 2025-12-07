import React from 'react'
import MyProfile from './ui/MyProfile'

const UserAccount = () => {
  return (
    <div className='py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8 overflow-hidden'>

      <div>
          <h1 className="font-bold text-xl md:text-2xl lg:text-[32px] ">MY ATTENDANCE</h1>
          <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">Detailed list of all attendance logs.</p>
      </div>

      <MyProfile />


    </div>
  )
}

export default UserAccount