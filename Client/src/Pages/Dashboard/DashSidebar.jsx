import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { CgLogOut } from "react-icons/cg";
import { MdSpaceDashboard, MdRateReview, MdArrowDropDown, MdArrowRight } from "react-icons/md";
import { TbReportSearch, TbCategoryPlus, TbLogs, TbArticle } from "react-icons/tb";
import { RiParentFill } from "react-icons/ri";

const DashSidebar = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("");
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [isAssessmentOpen,setIsAssessmentOpen]=useState(false);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setActive("Dashboard");
    } else if (location.pathname === "/reviews") {
      setActive("Reviews");
    } else if (location.pathname === "/parent") {
      setActive("Parent");
    } else if (location.pathname === "/provider") {
      setActive("Provider");
    }else if (location.pathname === "/approvearticle") {
      setActive("Approve Articles");
    } else if (location.pathname === "/addcategory") {
      setActive("Add Category");
    }
  }, [location.pathname]);

  const handleArticleClick = (section) => {
    setActive(section);
    if (section === "Add Category") {
      navigate("/viewcat");
    }  else if (section === "Approve Articles") {
      navigate("/viewarticle");
    } 
  };

  const handleAssessmentClick =(section )=>{
    setActive(section);
     if (section === "Add Assessment") {
      navigate("/addassessment");
    } else if (section === "Provider Assessments") {
      navigate("/providerassessment");
    }
  }

   const toggleAssessmentSection = () => {
    setIsAssessmentOpen((prev) => !prev);
  };

  const toggleArticleSection = () => {
    setIsArticleOpen(!isArticleOpen);
  };

  const handleLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminInfo");
  navigate("/log"); 
};

  return (
    <div className="w-56 bg-[#39a8a8] text-white flex-shrink-0 h-full flex flex-col rounded-br-2xl">
      <nav className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto">
        <label
          onClick={() => {
            setActive("Dashboard");
            navigate("/dashboard");
          }}
          className={`flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded 
            ${active === "Dashboard" 
              ? "bg-[#fbbf24] text-black" 
              : "text-white hover:bg-[#fbbf24] hover:text-black"
            }`}
        >
          <MdSpaceDashboard className="text-2xl" />
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
        >
          <RiParentFill className="text-2xl" />
          Parent
        </label>

        <label
          onClick={() => {
            setActive("Reports");
            navigate("/report");
          }}
          className={`flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded 
            ${active === "Reports" 
              ? "bg-[#fbbf24] text-black" 
              : "text-white hover:bg-[#fbbf24] hover:text-black"
            }`}
        >
          <TbReportSearch className="text-2xl" />
          Reports
        </label>

        <div className="transition-all duration-300">
          <div
            onClick={toggleArticleSection}
            className={`flex items-center justify-between font-semibold cursor-pointer transition p-3 rounded 
              ${active.includes("Articles") || active.includes("Category") 
                ? "bg-[#fbbf24] text-black" 
                : "text-white hover:bg-[#fbbf24] hover:text-black"
              }`}
          >
            <div className="flex items-center gap-2">
              <TbArticle className="text-2xl" />
              <span>Articles</span>
            </div>
            {isArticleOpen ? (
              <MdArrowDropDown className="text-xl transition-transform" />
            ) : (
              <MdArrowRight className="text-xl transition-transform" />
            )}
          </div>

          {isArticleOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#fbbf24] pl-2">
              <label
                onClick={() => handleArticleClick("Add Category")}
                className={`flex items-center gap-2 cursor-pointer transition p-2 rounded text-sm
                  ${active === "Add Category" 
                    ? "bg-[#fbbf24] text-black font-medium" 
                    : "text-white hover:bg-[#fbbf24] hover:text-black"
                  }`}
              >
                <TbCategoryPlus className="text-lg" />
                Add Category
              </label>

              {/* <label
                onClick={() => handleArticleClick("View Categories")}
                className={`flex items-center gap-2 cursor-pointer transition p-2 rounded text-sm
                  ${active === "View Categories" 
                    ? "bg-[#fbbf24] text-black font-medium" 
                    : "text-white hover:bg-[#fbbf24] hover:text-black"
                  }`}
              >
                <TbCategoryPlus className="text-lg" />
                View Categories
              </label> */}

              <label
                onClick={() => handleArticleClick("Approve Articles")}
                className={`flex items-center gap-2 cursor-pointer transition p-2 rounded text-sm
                  ${active === "Approve Articles" 
                    ? "bg-[#fbbf24] text-black font-medium" 
                    : "text-white hover:bg-[#fbbf24] hover:text-black"
                  }`}
              >
                <TbLogs className="text-lg" />
                View Articles
              </label>

              {/* <label
                onClick={() => handleArticleClick("View Articles")}
                className={`flex items-center gap-2 cursor-pointer transition p-2 rounded text-sm
                  ${active === "View Articles" 
                    ? "bg-[#fbbf24] text-black font-medium" 
                    : "text-white hover:bg-[#fbbf24] hover:text-black"
                  }`}
              >
                <TbLogs className="text-lg" />
                View Articles
              </label> */}
            </div>
          )}
        </div>

          <div className="transition-all duration-300">
          <div
            onClick={toggleAssessmentSection}
            className={`flex items-center justify-between font-semibold cursor-pointer transition p-3 rounded 
              ${
                active === "Add Assessment" || active === "Provider Assessments"
                  ? "bg-[#fbbf24] text-black"
                  : "text-white hover:bg-[#fbbf24] hover:text-black"
              }`}
          >
            <div className="flex items-center gap-2">
              <MdRateReview className="text-2xl" />
              <span>Assessment</span>
            </div>
            {isAssessmentOpen ? (
              <MdArrowDropDown className="text-xl transition-transform" />
            ) : (
              <MdArrowRight className="text-xl transition-transform" />
            )}
          </div>

          {isAssessmentOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#fbbf24] pl-2">
              <label
                onClick={() => handleAssessmentClick("Add Assessment")}
                className={`flex items-center gap-2 cursor-pointer transition p-2 rounded text-sm
                  ${
                    active === "Add Assessment"
                      ? "bg-[#fbbf24] text-black font-medium"
                      : "text-white hover:bg-[#fbbf24] hover:text-black"
                  }`}
              >
                <MdRateReview className="text-lg" />
                Add Assessment
              </label>

              <label
                onClick={() => handleAssessmentClick("Provider Assessments")}
                className={`flex items-center gap-2 cursor-pointer transition p-2 rounded text-sm
                  ${
                    active === "Provider Assessments"
                      ? "bg-[#fbbf24] text-black font-medium"
                      : "text-white hover:bg-[#fbbf24] hover:text-black"
                  }`}
              >
                <TbReportSearch className="text-lg" />
                Provider Assessments
              </label>
            </div>
)}
        </div>
      </nav>


      <div className="p-2">
        <button className="flex items-center justify-center gap-2 bg-[#fbbf24] text-black w-full py-2 rounded-lg shadow hover:bg-[#f0ab19] transition"
        onClick={handleLogout}>
          <CgLogOut className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default DashSidebar