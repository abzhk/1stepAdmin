import React from 'react'
import {useNavigate} from 'react-router-dom'

const Navbar = () => {

  const navigate = useNavigate();

  return (
    <div className='fixed top-0 left-0 w-full bg-gray-800 rounded-2xl h-16 flex shadow-md items-center gap-6 justify-end z-50'>
        <div className='bg-gray-800 rounded-4xl h-16 flex shadow-md items-center gap-6 justify-end '>
            <label className='text-white font-medium text-lg'>HOME</label>
            <label className='text-white font-semibold text-lg'>ABOUT</label>
            <label className='text-white font-semibold text-lg'>ADMINISTRATION</label>
            <label className='text-white font-semibold text-lg'>PROFESSIONAL MEMBERS</label>
            <label className='text-white afont-semibold text-lg'>BLOG</label>
            <label className='text-white font-semibold text-lg mr-4'>CONTACT</label>
              <button className='mr-4 bg-blue-600 text-black rounded-lg shadow-lg hover:bg-blue-700 transition duration-300' 
            onClick={()=>navigate('/log')}>Login</button>
        </div>
        <div>
            {/* <button className='mt-10 ml-10 bg-blue-600 text-black px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300' 
            onClick={()=>navigate('/log')}>Login</button> */}
        </div>
    </div>
  )
}

export default Navbar