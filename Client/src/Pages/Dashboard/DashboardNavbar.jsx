import React from 'react'
import {useNavigate} from 'react-router-dom'
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg'

const DashboardNavbar = () => {

  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#faf3e8] text-white p-4 ">
      <div className="flex justify-between">
       <img src={logo} alt="Logo" className="h-10 w-auto" />
        <div className="flex gap-6 ">
           <input
              type="text"
              placeholder="Search..."
              className="w-96 px-4 py-2 pl-10 rounded-4xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]"
            />
          {/* <label className="hover:text-gray-300">Home</label>

             <label className="hover:text-gray-300">About</label>

            <label className="hover:text-gray-300">Contact</label> */}
          {/* <button
  className="bg-[#fbbf24] text-black px-4 py-2 rounded-lg shadow hover:bg-[#f0ab19] transition"
>
  Logout
</button> */}
<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-white">
  A
</div>

        </div>
      </div>
    </div>
  )
}

export default DashboardNavbar