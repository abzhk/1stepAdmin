import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { CgLogOut } from "react-icons/cg";
import { MdSpaceDashboard, MdRateReview, MdArrowDropDown, MdArrowRight } from "react-icons/md";
import { TbReportSearch, TbCategoryPlus, TbLogs, TbArticle } from "react-icons/tb";
import { RiParentFill } from "react-icons/ri";
import { IoIosMan } from "react-icons/io";

const DashSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook to get current path
  const [active, setActive] = useState("");
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  // Define the base color for active/hover effects
  const activeBg = "bg-[#ffd333]"; // Your yellow color for active
  const hoverBg = "hover:bg-gray-100"; // Light gray hover for subtlety
  const activeText = "text-black";
  const defaultText = "text-gray-700"; // Darker text for white background

  useEffect(() => {
    // Logic to set the active state based on the current path
    const path = location.pathname;
    
    if (path.startsWith("/dashboard")) {
      setActive("Dashboard");
    } else if (path.startsWith("/reviews")) {
      setActive("Reviews");
    } else if (path.startsWith("/view-parent")) { // Changed from /parent
      setActive("Parent");
    } else if (path.startsWith("/allproviders")) { // Changed from /provider
      setActive("Provider");
    } else if (path.startsWith("/viewarticle")) { // Changed from /approvearticle
      setActive("Approve Articles");
    } else if (path.startsWith("/viewcat")) { // Changed from /addcategory
      setActive("Add Category");
    } else if (path.startsWith("/report")) {
      setActive("Reports");
    } else if (path.startsWith("/addassessment")) {
      setActive("Add Assessment");
    } else if (path.startsWith("/providerassessment")) {
      setActive("Provider Assessments");
    } else {
      setActive("");
    }
    
    // Auto-open dropdowns if a child item is active
    if (["Add Category", "Approve Articles"].includes(active)) {
      setIsArticleOpen(true);
    }
    if (["Add Assessment", "Provider Assessments"].includes(active)) {
      setIsAssessmentOpen(true);
    }
  }, [location.pathname, active]); // Added active as dependency for auto-open logic

  const handleArticleClick = (section) => {
    setActive(section);
    if (section === "Add Category") {
      navigate("/viewcat"); // Navigating to view categories
    } else if (section === "Approve Articles") {
      navigate("/viewarticle"); // Navigating to view/approve articles
    }
  };

  const handleAssessmentClick = (section) => {
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

  // Helper function for main link styles
  const getNavLinkClasses = (name) => `
    flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded-lg 
    ${active === name 
      ? `${activeBg} ${activeText} shadow-md` // Active state: yellow background, black text, shadow
      : `${defaultText} ${hoverBg}` // Default state: dark gray text, light gray hover
    }
  `;
  
  // Helper function for sub-link styles
  const getSubLinkClasses = (name) => `
    flex items-center gap-2 cursor-pointer transition p-2 rounded text-sm
    ${active === name
      ? `${activeBg} ${activeText} font-medium`
      : `${defaultText} ${hoverBg}`
    }
  `;

  return (
    <div className="w-56 bg-white text-gray-700  h-full flex flex-col border-r border-gray-200 shadow-xl border "> 
      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
        
        {/* Dashboard */}
        <label
          onClick={() => {
            setActive("Dashboard");
            navigate("/dashboard");
          }}
          className={getNavLinkClasses("Dashboard")}
        >
          <MdSpaceDashboard className="text-2xl" />
          Dashboard
        </label>

        {/* Provider */}
        <label
          onClick={() => {
            setActive("Provider");
            navigate("/allproviders");
          }}
          className={getNavLinkClasses("Provider")}
        >
          <IoIosMan className="text-2xl" />
          Provider
        </label>

        {/* Parent */}
        <label
          onClick={() => {
            setActive("Parent");
            navigate("/view-parent");
          }}
          className={getNavLinkClasses("Parent")}
        >
          <RiParentFill className="text-2xl" />
          Parent
        </label>

        {/* Reports */}
        <label
          onClick={() => {
            setActive("Reports");
            navigate("/report");
          }}
          className={getNavLinkClasses("Reports")}
        >
          <TbReportSearch className="text-2xl" />
          Reports
        </label>

        {/* Content Management  */}
        <div className="transition-all duration-300">
          <div
            onClick={toggleArticleSection}
            className={`flex items-center justify-between font-semibold cursor-pointer transition p-3 rounded-lg
              ${(active === "Add Category" || active === "Approve Articles")
                ? `${activeBg} ${activeText} shadow-md`
                : `${defaultText} ${hoverBg}`
              }
            `}
          >
            <div className="flex items-center gap-2">
              <TbArticle className="text-2xl" />
              <span className=''>Content </span>
            </div>
            {(isArticleOpen || active === "Add Category" || active === "Approve Articles") ? (
              <MdArrowDropDown className="text-xl transition-transform" />
            ) : (
              <MdArrowRight className="text-xl transition-transform" />
            )}
          </div>

          {(isArticleOpen || active === "Add Category" || active === "Approve Articles") && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#ffd333] pl-2"> 
              <label
                onClick={() => handleArticleClick("Add Category")}
                className={getSubLinkClasses("Add Category")}
              >
                <TbCategoryPlus className="text-lg" />
                View Categories
              </label>

              <label
                onClick={() => handleArticleClick("Approve Articles")}
                className={getSubLinkClasses("Approve Articles")}
              >
                <TbLogs className="text-lg" />
                View Articles
              </label>
            </div>
          )}
        </div>

        {/* Assessment (Dropdown) */}
        <div className="transition-all duration-300">
          <div
            onClick={toggleAssessmentSection}
            className={`flex items-center justify-between font-semibold cursor-pointer transition p-3 rounded-lg
              ${(active === "Add Assessment" || active === "Provider Assessments")
                ? `${activeBg} ${activeText} shadow-md`
                : `${defaultText} ${hoverBg}`
              }
            `}
          >
            <div className="flex items-center gap-2">
              <MdRateReview className="text-2xl" />
              <span>Assessment</span>
            </div>
            {(isAssessmentOpen || active === "Add Assessment" || active === "Provider Assessments") ? (
              <MdArrowDropDown className="text-xl transition-transform" />
            ) : (
              <MdArrowRight className="text-xl transition-transform" />
            )}
          </div>

          {(isAssessmentOpen || active === "Add Assessment" || active === "Provider Assessments") && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#ffd333] pl-2">
              <label
                onClick={() => handleAssessmentClick("Add Assessment")}
                className={getSubLinkClasses("Add Assessment")}
              >
                <MdRateReview className="text-lg" />
                Add Assessment
              </label>

              <label
                onClick={() => handleAssessmentClick("Provider Assessments")}
                className={getSubLinkClasses("Provider Assessments")}
              >
                <TbReportSearch className="text-lg" />
                Provider Assessments
              </label>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-200">
        <button
          className="flex items-center justify-center gap-2 bg-[#2d4a36] text-white w-full py-2 rounded-lg shadow hover:bg-[#ffd333] hover:text-black transition font-semibold"
          onClick={handleLogout}
        >
          <CgLogOut className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default DashSidebar