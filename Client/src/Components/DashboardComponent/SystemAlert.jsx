import React, { useEffect, useState } from "react";
import { AiFillWarning } from "react-icons/ai";
import { MdInfo } from "react-icons/md";
import { RiErrorWarningFill } from "react-icons/ri";
import { api } from "../../utils/api";

const SystemAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);

     const expiredRes = await api("/api/subscription/expired?days=0");


      const generatedAlerts = [];


      const expiredUsers = expiredRes?.data || [];

      expiredUsers.forEach((item) => {
        generatedAlerts.push({
          type: "critical",
          message: `${item.user} has expired the subscription for ${item.days} days`,
        });
      });


  
      if (generatedAlerts.length === 0) {
        generatedAlerts.push({
          type: "info",
          message: "System running normally",
        });
      }

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error("Alert fetch failed:", error);

      setAlerts([
        {
          type: "critical",
          message: "Failed to load alerts",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const alertConfig = {
    critical: {
      icon: <RiErrorWarningFill className="text-red-500 text-5xl h-10 w-10" />,
      bar: "bg-red-500",
    },
    warning: {
      icon: <AiFillWarning className="text-yellow-400 text-5xl h-10 w-10" />,
      bar: "bg-yellow-400",
    },
    info: {
      icon: <MdInfo className="text-blue-500 text-5xl h-10 w-10" />,
      bar: "bg-blue-400",
    },
  };

  return (
    <div>
      <div className="h-[370px] bg-white rounded-4xl shadow-sm border border-gray-200 p-6 hover:translate-y-1 hover:shadow-lg">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="text-subheading">
            System Alert
          </h3>

          {/*Warnings*/}
          <div className="flex items-center gap-6 text-sm font-medium text-greenmuted">
            <div className="flex items-center gap-2">
              <RiErrorWarningFill className="text-red-500 text-3xl" />
              <span>critical</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-greenmuted">
              <AiFillWarning className="text-yellow-400 text-3xl" />
              <span>warning</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-greenmuted">
              <MdInfo className="text-blue-500 text-3xl" />
              <span>info</span>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
          {loading ? (
            <p className="text-gray-500 text-sm flex justify-center mt-20">
              Loading alerts...
            </p>
          ) : alerts.length === 0 ? (
            <p className="text-gray-500 text-sm flex justify-center mt-20">
              No alerts
            </p>
          ) : (
            alerts.map((alert, index) => {
              const config = alertConfig[alert.type];

              return (
                <div
                  key={index}
                  className="flex items-center bg-offwhite rounded-xl overflow-hidden"
                >

                  <div className={`w-2 h-full ${config.bar}`} />


                  <div className="px-5">{config.icon}</div>


                  <p className="text-md font-medium text-greenmuted  pr-4">
                    {alert.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAlert;