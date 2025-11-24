import React from 'react'
import { Outlet } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import DashSidebar from './DashSidebar'

const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      <DashboardNavbar />
      <div className="flex flex-1 overflow-hidden w-screen">
        <DashSidebar />
        <div className="flex-1 overflow-auto bg-gray-100">
          <Outlet /> 
        </div>
      </div>
    </div>
  )
}

export default Layout