import React from 'react'
import { AiFillWarning } from "react-icons/ai";
import { MdInfo } from "react-icons/md";
import { RiErrorWarningFill } from "react-icons/ri";

const SystemAlert = () => {
  return (
    <div>
       
        <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h3 className="text-lg font-semibold text-gray-800">System Alert</h3>
        
              <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <RiErrorWarningFill className="text-red-500 text-3xl" />
                  <span>critical</span>
                </div>
        
                <div className="flex items-center gap-2">
                  <AiFillWarning className="text-yellow-400 text-3xl" />
                  <span>warning</span>
                </div>
        
                <div className="flex items-center gap-2">
                  <MdInfo className="text-blue-500 text-3xl" />
                  <span>info</span>
                </div>
              </div>
            </div>
        
            <div className="space-y-4">
              <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                <div className="w-4 h-18 bg-red-500 rounded-r-xl"></div>
                <div className="px-5">
                  <RiErrorWarningFill className="text-red-500 text-5xl" />
                </div>
                <p className="text-md text-gray-800 font-medium">
                  subscription alert for student
                </p>
              </div>
        
              <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                <div className="w-4 h-18 bg-yellow-400 rounded-r-xl"></div>
                <div className="px-5">
                  <AiFillWarning className="text-yellow-400 text-5xl" />
                </div>
                <p className="text-md text-gray-800 font-medium">
                  parent inactive for 30 days
                </p>
              </div>
        
              <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                <div className="w-4 h-18 bg-blue-400 rounded-r-xl"></div>
                <div className="px-5">
                  <MdInfo className="text-blue-500 text-5xl" />
                </div>
                <p className="text-md text-gray-800 font-medium">
                  growth analyst low
                </p>
              </div>
            </div>
          </div>
          </div>
  
  )
}

export default SystemAlert