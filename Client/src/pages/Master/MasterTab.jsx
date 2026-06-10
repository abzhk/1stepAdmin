import React, { useState } from "react";
import MasterData from "./MasterData";  
import TagArticle from "./TagArticle";   
import { FaCogs, FaTags, FaMoneyBillWave } from "react-icons/fa";
import BillingInterval from "./BillingInterval";

const MasterPage = () => {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <div className="min-h-screen bg-offwhite p-6">
      <div className="max-w-7xl mx-auto">


        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl ${
              activeTab === "services"
                ? "bg-darkgreen text-white"
                : "bg-white shadow"
            }`}
          >
            <FaCogs />
            Services
          </button>

          <button
            onClick={() => setActiveTab("tags")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl ${
              activeTab === "tags"
                ? "bg-darkgreen text-white"
                : "bg-white shadow"
            }`}
          >
            <FaTags />
            Tags
          </button>


 <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl ${
              activeTab === "billing"
                ? "bg-darkgreen text-white"
                : "bg-white shadow"
            }`}
          >
            <FaMoneyBillWave />
            Billing
          </button>

        </div>

        <div>
          {activeTab === "services" && <MasterData />}
          {activeTab === "tags" && <TagArticle />}
            {activeTab === "billing" && <BillingInterval />}
        </div>

      </div>
    </div>
  );
};

export default MasterPage;