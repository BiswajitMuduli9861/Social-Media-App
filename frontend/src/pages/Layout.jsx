import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'

const Layout = () => {

  const user = useSelector((state)=>state.user.value);

  const [sidebarOpen, setSidebarOpen] = useState(false)
  return user ? (
    <div className='w-full flex h-[97.4vh]'>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>

      <div className='w-full'>
        <Outlet/>
      </div>
      {
        sidebarOpen ?
        <X onClick={()=>setSidebarOpen(false)} className='absolute top-3 right-3 p-2 z-10 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'/>
        :
        <Menu onClick={()=>setSidebarOpen(true)} className='absolute top-3 right-3 p-2 z-10 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'/>
      }
    </div>
  ):(
    <Loading/>
  )
}

export default Layout
