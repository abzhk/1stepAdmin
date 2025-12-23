import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Settings, Info, Mail, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import ProfileImage from '../../assets/profile.jpeg';
import NavSearch from '../../utils/navbarSearch.jsx';

const DashboardNavbar = ({ searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  
  // States for both dropdowns
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Mock Notifications Data
  const notifications = [
    { id: 1, text: "Your report is ready to download", time: "2m ago", type: "success" },
    { id: 2, text: "New login detected from Chrome", time: "1h ago", type: "warning" },
    { id: 3, text: "Server maintenance scheduled", time: "5h ago", type: "info" },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full text-white p-4">
      <div className="flex justify-end">
        <div className="flex items-center gap-6">
          
          {/* Search Input */}
         <NavSearch 
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
/>


          {/* Notification Bell & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
              className={`relative p-2 transition-colors rounded-full hover:bg-gray-100 ${isNotifOpen ? 'text-[#fbbf24] bg-gray-100' : 'text-gray-400'}`}
            >
              <Bell size={24} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-gray-800 font-bold">Notifications</h3>
                  <button className="text-xs text-[#fbbf24] font-semibold hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex gap-3">
                        {n.type === 'success' ? <CheckCircle size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-blue-500" />}
                        <div>
                          <p className="text-sm text-gray-700">{n.text}</p>
                          <span className="text-xs text-gray-400">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center bg-gray-50">
                  <button className="text-sm text-gray-500 hover:text-gray-800 font-medium">View All</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            >
              <div className="relative">
                <img
                  src={ProfileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 group-hover:border-[#fbbf24] transition-all"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#fbbf24]">
                  <Settings size={18} />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
                <Link to="/about" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#fbbf24]">
                  <Info size={18} />
                  <span className="text-sm font-medium">About Us</span>
                </Link>
                <Link to="/contact" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#fbbf24]">
                  <Mail size={18} />
                  <span className="text-sm font-medium">Contact Us</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;