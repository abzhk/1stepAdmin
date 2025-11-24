import React from 'react'
import Navbar from '../Components/Navbar'
import Home from './Home.jsx'
import About from './About.jsx'

const Landing = () => {
  return (
    <div className='w-screen h-screen bg-gray-50'>
      <Navbar />
      <div className=''> 
        <Home />
      </div>
      <About/>
    </div>
  )
}

export default Landing
