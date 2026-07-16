import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CgLogOut } from "react-icons/cg";
import { MdRateReview } from "react-icons/md";
import {
  TbReportSearch,
  TbCategoryPlus,
  TbLogs,
  TbArticle,
  TbLockAccess,
} from "react-icons/tb";
import { PiUsersThreeDuotone } from "react-icons/pi";
import { HiUserAdd } from "react-icons/hi";
import { LayoutDashboard } from "lucide-react";
import { RiParentFill, RiMastercardFill } from "react-icons/ri";
import { IoIosMan } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { SiHelpdesk } from "react-icons/si";
import logo from "../../assets/logo-18.png";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slice/authSlice.js";
import toast from "react-hot-toast";
import { api } from "../../utils/api.js";
import { MODULES, ACTIONS } from "../../constants/permission.js";

const DashSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const role = useSelector((state) => state.auth.user?.role);
  const permissions = useSelector(
    (state) => state.auth.user?.permissions || [],
  );

  const hasModuleAccess = (moduleName) => {
    if (role === "Super Admin") return true;

    return permissions.some((p) => p.module === moduleName);
  };

  const canAccess = (module, action) => {
    if (role === "Super Admin") return true;

    const perm = permissions.find((p) => p.module === module);
    return perm?.actions.includes(action);
  };
  const [active, setActive] = useState("");
  const [hoverMenu, setHoverMenu] = useState(null);
  const timeoutRef = useRef(null);

  const parentMap = {
    "Add Category": "Content",
    "Approve Articles": "Content",
    "Add Assessment": "Assessment",
    "Provider Assessments": "Assessment",
  };

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/dashboard")) setActive("Dashboard");
    else if (path.startsWith("/create-admin")) setActive("User");
    else if (
      path.startsWith("/allproviders") ||
      path.startsWith("/view-parent") ||
      path.startsWith("/centre")
    )
      setActive("User");
    else if (path.startsWith("/create-Role")) setActive("Settings");
    else if (path.startsWith("/add-plans")) setActive("Plans");
    else if (path.startsWith("/viewcat")) setActive("Add Category");
    else if (path.startsWith("/viewarticle")||  path.startsWith("/add-article")||  path.startsWith("/list-view-article")
    ) setActive("Approve Articles");
    else if (path.startsWith("/addassessment")) setActive("Add Assessment");
    else if (path.startsWith("/admin-help-desk")||  path.startsWith("/contact"))
       setActive("Help desk");
    else if (path.startsWith("/providerassessment")||  path.startsWith("/assessment-list"))
      setActive("Provider Assessments");
    else if (path.startsWith("/master")) setActive("Master Data");
    else setActive("");
  }, [location.pathname]);

  const isActive = (name) => active === name || parentMap[active] === name;

  const openMenu = (menu) => {
    clearTimeout(timeoutRef.current);
    setHoverMenu(menu);
  };

  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => {
      setHoverMenu(null);
    }, 180);
  };

  const handleLogout = async () => {
    try {
      await api("/api/admin/admin/logout", { method: "POST" });
      dispatch(logout());
      toast.success("Logged out ");
      navigate("/log");
    } catch (err) {
      console.error(err);
    }
  };

  const iconBtn = (name, icon, onClick) => {
    const activeState = isActive(name);

    return (
      <div className="relative group">
        <button
          onClick={onClick}
          style={{
            backgroundColor: activeState ? "#14532d" : "transparent",
          }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            activeState
              ? "scale-110 shadow-lg shadow-emerald-900/20"
              : "hover:bg-[#8fa797] hover:bg-opacity-80"
          }`}
        >
          {React.cloneElement(icon, {
            size: 25,
            style: { color: activeState ? "#facc15" : undefined },
            className: !activeState
              ? "text-[#CBD5E1] group-hover:text-white"
              : "",
          })}
        </button>

        {/* Tooltip */}
        <div className="absolute left-full top-0 ml-7 invisible opacity-0 -translate-x-5 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out z-50 w-auto pointer-events-none group-hover:pointer-events-auto">
          <div className="absolute -left-5 top-0 w-5 h-full bg-transparent" />
          <div className="bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl whitespace-nowrap mt-2">
            {name}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-24 bg-greenmuted h-screen flex flex-col items-center justify-between py-6 shadow-xl rounded-l-xl">
      {/* TOP */}
      <div className="flex flex-col items-center gap-6">
        {/* LOGO */}
        <img src={logo} className="h-14 text-yellow   " />

        {/* NAV */}
        <nav className="flex flex-col gap-2 items-center">
          {iconBtn("Dashboard", <LayoutDashboard />, () => {
            setActive("Dashboard");
            navigate("/dashboard");
          })}

          {/* USER MENU */}
           {hasModuleAccess(MODULES.Roles) && (
          <div
            className="relative group"
            onMouseEnter={() => openMenu("user")}
            onMouseLeave={closeMenu}
          >
            {iconBtn("User", <PiUsersThreeDuotone />, () => {})}

            {hoverMenu === "user" && (
              <div className="absolute left-full top-0 ml-6 w-56 bg-white shadow-xl rounded-xl p-4 z-50">
                <div
                  onClick={() => navigate("/allproviders")}
                  className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                >
                  <IoIosMan /> Provider
                </div>
                <div
                  onClick={() => navigate("/view-parent")}
                  className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                >
                  <RiParentFill /> Parent
                </div>
                <div
                  onClick={() => navigate("/centre")}
                  className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                >
                  <RiParentFill /> Centre
                </div>
                {role === "Super Admin" && (
                  <div
                    onClick={() => navigate("/create-admin")}
                    className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                  >
                    <HiUserAdd />
                    Create User
                  </div>
                )}
              </div>
            )}
          </div>
           )}

          {hasModuleAccess(MODULES.PLANS) &&
            iconBtn("Plans", <TbReportSearch />, () => navigate("/add-plans"))}

          {/* CONTENT MENU */}
          {hasModuleAccess(MODULES.ARTICLES) && (
          <div
            className="relative group"
            onMouseEnter={() => openMenu("content")}
            onMouseLeave={closeMenu}
          >
            {iconBtn("Content", <TbArticle />, () => {})}

            {hoverMenu === "content" && (
              <div className="absolute left-full top-0 ml-6 w-56 bg-white shadow-xl rounded-xl p-4 z-50">
                <div
                  onClick={() => navigate("/viewcat")}
                  className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                >
                  <TbCategoryPlus /> Categories
                </div>
                <div
                  onClick={() => navigate("/viewarticle")}
                  className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                >
                  <TbLogs /> Articles
                </div>
              </div>
            )}
          </div>
          )}

          {/* ASSESSMENT MENU */}
          {hasModuleAccess(MODULES.ASSESSMENT) && (
            <div
              className="relative group"
              onMouseEnter={() => openMenu("assessment")}
              onMouseLeave={closeMenu}
            >
              {iconBtn("Assessment", <MdRateReview />, () => {})}

              {hoverMenu === "assessment" && (
                <div className="absolute left-full top-0 ml-6 w-56 bg-white shadow-xl rounded-xl p-4 z-50">
                  <div
                    onClick={() => navigate("/addassessment")}
                    className="p-2 hover:bg-darkgreen hover:text-white rounded-2xl cursor-pointer"
                  >
                    Add Assessment
                  </div>
                  <div
                    onClick={() => navigate("/providerassessment")}
                    className="p-2 hover:bg-darkgreen hover:text-white rounded-2xl cursor-pointer"
                  >
                    Provider Assessments
                  </div>
                  <div
                    onClick={() => navigate("/assessment-list")}
                    className="p-2 hover:bg-darkgreen hover:text-white rounded-2xl cursor-pointer"
                  >
                   Add Assessment & Questinary
                  </div>
                </div>
              )}
            </div>
          )}

          {hasModuleAccess(MODULES.MASTER_DATA) &&
            iconBtn("Master Data", <RiMastercardFill />, () =>
              navigate("/master"),
            )}

         {/* HELP DESK MENU */}
           {hasModuleAccess(MODULES.HELP) && (
<div
  className="relative group"
  onMouseEnter={() => openMenu("helpdesk")}
  onMouseLeave={closeMenu}
>
  {iconBtn("Help desk", <SiHelpdesk />, () => {})}

  {hoverMenu === "helpdesk" && (
    <div className="absolute left-full top-0 ml-6 w-56 bg-white shadow-xl rounded-xl p-4 z-50">
      <div
        onClick={() => {
          setActive("Help desk");
          navigate("/admin-help-desk");
        }}
        className="p-2 hover:bg-darkgreen hover:text-white rounded-2xl flex gap-2 cursor-pointer"
      >
        <SiHelpdesk />
        Help Desk
      </div>

      <div
        onClick={() => {
          setActive("Contact");
          navigate("/contact");
        }}
        className="p-2 hover:bg-darkgreen hover:text-white rounded-2xl flex gap-2 cursor-pointer"
      >
        <IoIosMan />
        Contact
      </div>
    </div>
    
  )}
</div>
  )}


          {/* SETTINGS MENU */}
          <div
            className="relative group"
            onMouseEnter={() => openMenu("settings")}
            onMouseLeave={closeMenu}
          >
            {iconBtn("Settings", <IoSettingsOutline />, () => {})}

            {hoverMenu === "settings" && (
              <div className="absolute left-full top-0 ml-6 w-56 bg-white shadow-xl rounded-xl p-4 z-50">
                <div
                  onClick={() => navigate("/admin-profile")}
                  className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                >
                  <IoIosMan /> Profile
                </div>

                {/* <div
                  onClick={() => navigate("/profile-settings")}
                  className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                >
                  <IoSettingsOutline /> Profile Settings
                </div> */}

                {role === "Super Admin" && (
                  <div
                    onClick={() => navigate("/create-Role")}
                    className="p-2 hover:bg-darkgreen  hover:text-white rounded-2xl flex gap-2 cursor-pointer"
                  >
                    <TbLockAccess /> Roles & Access
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="text-slate-300 hover:text-rose-500 transition"
      >
        <CgLogOut size={24} />
      </button>
    </aside>
  );
};

export default DashSidebar;
