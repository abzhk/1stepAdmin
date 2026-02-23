import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { CgLogOut } from "react-icons/cg";
import { MdSpaceDashboard, MdRateReview, MdArrowDropDown, MdArrowRight } from "react-icons/md";
import { TbReportSearch, TbCategoryPlus, TbLogs, TbArticle } from "react-icons/tb";
import { RiParentFill } from "react-icons/ri";
import { IoIosMan } from "react-icons/io";
import logo from '../../assets/logo.svg'
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slice/authSlice";

const DashSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [active, setActive] = useState("");
  // const [isArticleOpen, setIsArticleOpen] = useState(false);
  // const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const role = useSelector((state) => state.auth.user?.role);
  
  const dispatch = useDispatch();


  //base color for active/hover effects
  const activeBg = "bg-darkgreen"; 
  const hoverBg = "hover:bg-darkgreen hover:text-white"; 
  const activeText = "text-white";
  const defaultText = "text-white"; 

  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith("/dashboard")) {
      setActive("Dashboard");
    }else if (path.startsWith("/create-admin")) {
      setActive("Create User");
    } else if (path.startsWith("/view-parent")||
      path.startsWith("/inactive-parents")||
       path.startsWith("/parent-stats-card")||
        path.startsWith("/parent/edit/")) { 
      setActive("Parent");
    } else if (path.startsWith("/allproviders")||
      path.startsWith("/inactive-providers")||
       path.startsWith("/provider-stats")||
        path.startsWith("/providers/edit")) { 
      setActive("Provider");
     } else if (path.startsWith("/create-Role")) { 
      setActive("Role");
       } else if (path.startsWith("/add-plans")||
      path.startsWith("/view-plans")) {
      setActive("Plans and Features");
    } else if (path.startsWith("/viewarticle")) {
      setActive("Approve Articles");
    } else if (path.startsWith("/viewcat")) { 
      setActive("Add Category");
    } else if (path.startsWith("/report")) {
      setActive("Reports");
    } else if (path.startsWith("/addassessment")) {
      setActive("Add Assessment");
    } else if (path.startsWith("/providerassessment")) {
      setActive("Provider Assessments");
    } else if (path.startsWith("/master-data")) {
      setActive("Master Data");
    } else {
      setActive("");
    }
    
    // Auto-open dropdowns if a child item is active
    // if (["Add Category", "Approve Articles"].includes(active)) {
    //   setIsArticleOpen(true);
    // }
    // if (["Add Assessment", "Provider Assessments"].includes(active)) {
    //   setIsAssessmentOpen(true);
    // }
  }, [location.pathname, active]); 

  // const handleArticleClick = (section) => {
  //   setActive(section);
  //   if (section === "Add Category") {
  //     navigate("/viewcat");
  //   } else if (section === "Approve Articles") {
  //     navigate("/viewarticle"); 
  //   }
  // };

  // const handleAssessmentClick = (section) => {
  //   setActive(section);
  //   if (section === "Add Assessment") {
  //     navigate("/addassessment");
  //   } else if (section === "Provider Assessments") {
  //     navigate("/providerassessment");
  //   }
  // }

  // const toggleAssessmentSection = () => {
  //   setIsAssessmentOpen((prev) => !prev);
  // };

  // const toggleArticleSection = () => {
  //   setIsArticleOpen(!isArticleOpen);
  // };

  const handleLogout = async () => {
  try {
    const API = import.meta.env.VITE_API_URL;
    await fetch(`${API}/api/admin/logout`, {
      method: "POST",
      credentials: "include", 
    });
    dispatch(logout());
    navigate("/log");
  } catch (error) {
    console.error("Logout error", error);
  }
};



  const getNavLinkClasses = (name) => `
    flex items-center gap-2 font-semibold cursor-pointer transition p-3 rounded-lg 
    ${active === name 
      ? `${activeBg} ${activeText} shadow-md`
      : `${defaultText} ${hoverBg}` 
    }
  `;
  

  // const getSubLinkClasses = (name) => `
  //   flex items-center gap-2 cursor-pointer transition p-2 rounded text-sm
  //   ${active === name
  //     ? `${activeBg} ${activeText} font-medium`
  //     : `${defaultText} ${hoverBg}`
  //   }
  // `;

  return (
    <div className="w-56 bg-greenmuted text-gray-700  h-full flex flex-col shadow-xl border  rounded-3xl "> 
    <div className="  flex justify-center p-4">
      <img src={logo} alt="Logo" className="h-10 w-auto invert brightness-0" />
    </div>
      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto  rounded-4xl">
        
        {/* Dashboard */}
        <label
          onClick={() => {
            setActive("Dashboard");
            navigate("/dashboard");
          }}
          className={getNavLinkClasses("Dashboard")}
        >
          <MdSpaceDashboard className="text-lg  " />
         <span className = "text-lg"> Dashboard</span>
        </label>
        {role === "super_admin" && (
  <label
    onClick={() => {
      setActive("Create User");
      navigate("/create-admin");
    }}
    className={getNavLinkClasses("Create User")}
  >
    <MdSpaceDashboard className="text-lg" />
   <span className = "text-lg">Create User</span> 
  </label>
)}


        {/* Provider */}
        <label
          onClick={() => {
            setActive("Provider");
            navigate("/allproviders");
          }}
          className={getNavLinkClasses("Provider")}
        >
          <IoIosMan className="text-lg" />
         <span className = "text-lg">Provider</span> 
        </label>

        {/* Parent */}
        <label
          onClick={() => {
            setActive("Parent");
            navigate("/view-parent");
          }}
          className={getNavLinkClasses("Parent")}
        >
          <RiParentFill className="text-lg" />
          <span className = "text-lg">Parent</span>
        </label>

        {/* Reports */}
        {/* <label
          onClick={() => {
            setActive("Reports");
            navigate("/report");
          }}
          className={getNavLinkClasses("Reports")}
        >
          <TbReportSearch className="text-sm" />
          Reports
        </label> */}
         <label
          onClick={() => {
            setActive("Plans and Features");
            navigate("/add-plans");
          }}
          className={getNavLinkClasses("Plans and Features")}
        >
          <TbReportSearch className="text-lg" />
         <span className = "text-lg">Plans and Features</span>
        </label>
         {role === "Super Admin" && (
         <label
          onClick={() => {
            setActive("Role");
            navigate("/create-Role");
          }}
          className={getNavLinkClasses("Role")}
        >
          <TbReportSearch className="text-lg" />
          <span className = "text-lg"> Roles and access</span>
        </label>
        )} 

        {/* Content Management  */}
        {/* <div className="transition-all duration-300">
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
              <TbArticle className="text-lg" />
              <span className='text-lg'>Content </span>
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
                <TbCategoryPlus className="text-sm" />
                View Categories
              </label>

              <label
                onClick={() => handleArticleClick("Approve Articles")}
                className={getSubLinkClasses("Approve Articles")}
              >
                <TbLogs className="text-l" />
                View Articles
              </label>
            </div>
          )}
        </div> */}

        {/* Assessment (Dropdown) */}
        {/* <div className="transition-all duration-300">
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
              <MdRateReview className="text-lg" />
              <span className="text-lg">Assessment</span>
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
</div> */}
           <label
          onClick={() => {
            setActive("Master Data");
            navigate("/master-data");
          }}
          className={getNavLinkClasses("Master Data")}
        >
          <RiParentFill className="text-lg" />
          <span className = "text-lg">Master Data</span>
        </label> 
              
        
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-200 mb-2">
        <button
          className="flex items-center justify-center gap-2 bg-peach text-white w-full py-2 rounded-lg shadow hover:bg-lighthov hover:text-black transition font-semibold"
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