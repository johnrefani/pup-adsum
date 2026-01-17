import React from 'react'
import { MyProfile } from '@/lib/imports'

const UserAccount = () => {
  return (
    <div className='py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8 overflow-hidden'>

      <div>
          <h1 className="font-bold text-xl md:text-2xl lg:text-[32px] ">My Account</h1>
          <p className="font-medium text-sm md:text-base lg:text-xl text-black/75">Manage my account.</p>
      </div>

      <MyProfile />


    </div>
  )
}

export default UserAccount