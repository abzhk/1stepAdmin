import React, { useEffect, useState } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import doctor from "../../Assets/Doctor image.jpg";
import { TbPasswordFingerprint } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const messages = [
  "Welcome — please login to access your account",
  "Secure. Fast. Reliable.",
  "Need help? Contact support anytime",
];

const Login = () => {
  const [idx, setIdx] = useState(0);

   const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((p) => (p + 1) % messages.length);
    }, 2000); 
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    googleLogout();
    console.log("logout successful");
  };

  return (
    <div className="w-screen h-screen p-2 flex">
      <div className="w-1/2 bg-gray-800 flex flex-col items-center justify-start rounded-2xl p-8">
        <div className="w-full flex items-center justify-start mb-10">
          <img
            src={doctor}
            alt="Logo"
            className="w-20 h-20 object-cover rounded-full shadow-lg"
          />
          <div className="ml-4 text-white">
            <h1 className="text-2xl font-bold">OneStep</h1>
            <p className="text-sm opacity-80">Health at your fingertips</p>
          </div>
        </div>

        <div className="w-full max-w-xl h-96 bg-gray-900/40 rounded-2xl flex flex-col items-center justify-center p-6 mt-30">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45 }}
              className="text-center text-white text-lg font-medium px-4"
            >
              {messages[idx]}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-2 mt-4">
            {messages.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      
      </div>

      <div className="w-1/2 h-full bg-white flex items-center justify-center p-2 rounded-2xl">
        <div>
          <div className="flex flex-col bg-gray-50 p-4 h-96 w-96 rounded-3xl shadow-2xl gap-1 ">
            <label className=" font-semibold">User Name</label>
            <div className="relative w-full">
              <FaUser className="absolute left-3 top-6 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full border-2 border-gray-300 rounded-lg mb-4 p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <label className=" font-semibold">Password</label>
            <div className="relative w-full">
              <TbPasswordFingerprint className="absolute left-3 top-6 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border-2 border-gray-300 rounded-lg mb-4 p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
              <button className=' bg-blue-600 text-black px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300' 
            onClick={()=>navigate('/dashboard')}>Login</button>
            
            <div className="flex">
              <p>Not yet created ?</p>
              <Link to="/" className=" ml-2">
                Create Account
              </Link>
            </div>
            <div>
            <GoogleLogin
              onSuccess={(credentialResponce) => {
                console.log(credentialResponce);
              }}
              onError={() => console.log("login failed")}
              auto_select={true} 
             theme="outline" 
             size="large"    
             text="signin_with"
             shape="pill"     
             logo_alignment="left"
    />
    </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
