import React, { useState,useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { CgLogOut } from "react-icons/cg";
import { MdSpaceDashboard, MdRateReview  } from "react-icons/md";
import { TbReportSearch ,TbCategoryPlus ,TbLogs} from "react-icons/tb";
import { RiParentFill } from "react-icons/ri";



const DashSidebar = () => {
const navigate = useNavigate();
 const [active, setActive] = useState("");

 useEffect(() => {
    if (location.pathname === "/dashboard") {
      setActive("Dashboard");
    } else if (location.pathname === "/viewcat") {
      setActive("Categories");
    } else if (location.pathname === "/blogs") {
      setActive("Blogs");
    } else if (location.pathname === "/reviews") {
      setActive("Reviews");
    } else if (location.pathname === "/parent") {
      setActive("Parent");
    } else if (location.pathname === "/provider") {
      setActive("Provider");
    }
  }, [location.pathname]);

  return (

<div className="w-56 bg-[#39a8a8] text-white flex-shrink-0 h-full overflow-y-auto rounded-br-2xl">
  <nav className="flex flex-col gap-2 p-2">

    <label
      onClick={() => {
        setActive("Dashboard");
        navigate("/dashboard");
      }}
      className={` flex  items-center gap-2 font-semibold cursor-pointer transition p-3 rounded 
        ${active === "Dashboard" 
          ? "bg-[#fbbf24] text-black" 
          : "text-white hover:bg-[#fbbf24] hover:text-black"
        }`}
    ><MdSpaceDashboard className="text-2xl" />
      Dashboard
    </label>

 <label
      onClick={() => {
        setActive("Provider");
        navigate("/categories");
      }}
      className={`font-semibold cursor-pointer transition p-3 rounded 
        ${active === "Provider" 
          ? "bg-[#fbbf24] text-black" 
          : "text-white hover:bg-[#fbbf24] hover:text-black"
        }`}
    >
      Provider
    </label>
     <label
      onClick={() => {
        setActive("Parent");
        navigate("/parent");
      }}
      className={`flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded
        ${active === "Parent" 
          ? "bg-[#fbbf24] text-black" 
          : "text-white hover:bg-[#fbbf24] hover:text-black"
        }`}
    ><RiParentFill className="text-2xl" />
      Parent
    </label>

    <label
      onClick={() => {
        setActive("Blogs");
        navigate("/blogs");
      }}
      className={` flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded 
        ${active === "Blogs" 
          ? "bg-[#fbbf24] text-black" 
          : "text-white hover:bg-[#fbbf24] hover:text-black"
        }`}
    ><TbReportSearch className="text-2xl" />
      Reports
    </label>

    <label
      onClick={() => {
        setActive("Categories");
        navigate("/viewcat");
      }}
      className={`flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded 
        ${active === "Categories" 
          ? "bg-[#fbbf24] text-black" 
          : "text-white hover:bg-[#fbbf24] hover:text-black"
        }`}
    ><TbCategoryPlus  className="text-2xl"/>
      Categories
    </label>

    <label
      onClick={() => {
        setActive("Blogs");
        navigate("/blogs");
      }}
      className={`flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded 
        ${active === "Blogs" 
          ? "bg-[#fbbf24] text-black" 
          : "text-white hover:bg-[#fbbf24] hover:text-black"
        }`}
    ><TbLogs className="text-2xl" />
      Blogs
    </label>

    <label
      onClick={() => {
        setActive("Reviews");
        navigate("/reviews");
      }}
      className={`flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded
        ${active === "Reviews" 
          ? "bg-[#fbbf24] text-black" 
          : "text-white hover:bg-[#fbbf24] hover:text-black"
        }`}
    ><MdRateReview className="text-2xl" />
      Reviews
    </label>

  </nav>
   <button
  className="flex items-center gap-2 bg-[#fbbf24] text-black px-16 py-2 rounded-lg shadow hover:bg-[#f0ab19] transition mt-50 ml-2"
>
  <CgLogOut className="text-xl" />
  <span>Logout</span>
</button>
</div>

  )
}

export default DashSidebar