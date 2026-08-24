import React, { useState } from "react";
import MasterData from "./MasterData";  
import TagArticle from "./TagArticle";   
import OurServices from "./OurServices";
import { FaCogs, FaTags, FaMoneyBillWave,FaUserMd, FaStethoscope, } from "react-icons/fa";
import BillingInterval from "./BillingInterval";
import Specialization from "./Specialization";

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
            onClick={() => setActiveTab("our-services")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl ${
              activeTab === "our-services"
                ? "bg-darkgreen text-white"
                : "bg-white shadow"
            }`}
          >
            < FaStethoscope />
            Our Services
          </button>

          <button
  onClick={() => setActiveTab("specialization")}
  className={`flex items-center gap-2 px-5 py-2 rounded-xl ${
    activeTab === "specialization"
      ? "bg-darkgreen text-white"
      : "bg-white shadow"
  }`}
>
  <FaUserMd />
  Specialization
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
          {activeTab === "our-services" && <OurServices />}
            {activeTab === "specialization" && <Specialization />}
          {activeTab === "tags" && <TagArticle />}
            {activeTab === "billing" && <BillingInterval />}
        </div>

      </div>
    </div>
  );
};

export default MasterPage;