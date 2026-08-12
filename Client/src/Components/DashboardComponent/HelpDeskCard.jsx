import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { api } from "../../utils/api.js";
import  formatdatateUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard";
import { MODULES, ACTIONS } from "../../constants/permission";

const StatusBadge = ({ status }) => {
  const styles = {
    Open: "bg-red-50 text-red-500",
    "In Progress": "bg-yellow-200 text-yellow-600",
    Resolved: "bg-green-50 text-green-600",
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const HelpDeskCard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  const latestTickets = tickets.slice(0, 3);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await api("/api/help/all-tickets");

        setTickets(
          [...(data.tickets || [])]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3),
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchTickets();
  }, []);

  return (
     <PermissionGuard module={MODULES.HELP} action={ACTIONS.READ}>
    <div className="h-[380px] bg-white rounded-3xl shadow-md p-6 flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-subheading tracking-wide">Help Desk Activity</h3>

        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
          {latestTickets.length}
        </span>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
        {latestTickets.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center p-3 rounded-xl hover:bg-offwhite transition group"
          >
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2d4a36] to-[#426b50] text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                {item.user?.username?.charAt(0)}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800 group-hover:text-black">
                  {item.title}
                </p>
                <p className="text-xs text-green-700 font-medium">
                  {item.user?.email}
                </p>
                <p className="text-sm font-medium text-gray-800 group-hover:text-black">
                  {item.displayName}
                </p>
              </div>
            </div>

            <div className="text-right">
              <StatusBadge status={item.status} />
              <p className="text-[10px] text-gray-400 mt-1">
                 {formatdatateUtils(item.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="pt-4 flex justify-end">
       
        <button
          onClick={() => navigate("/admin-help-desk")}
          className="bg-gradient-to-r from-[#2d4a36] to-[#426b50] text-white p-3 rounded-full hover:scale-105 transition shadow-md"
        >
          <FiArrowRight />
        </button>
        
      </div>
    </div>
    </PermissionGuard>
  );
};

export default HelpDeskCard;
