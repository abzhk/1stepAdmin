/**
 * @file MasterTab.jsx
 * @author Imran
 * @created 12/01/2025
 * @lastModified 10/11/2026 by Imran
 *
 * [ChangeLog]:
 * - 12/01/2025: Initial MasterPage tab bar implementation.
 * - 10/11/2026: Added Our Resources tab to manage navbar resources masterData by Imran.
 */
import React, { useState } from "react";
import MasterData from "./MasterData";  
import TagArticle from "./TagArticle";   
import OurServices from "./OurServices";
import OurResources from "./OurResources";
import { BookOpen } from "lucide-react";
import { FaCogs, FaTags, FaMoneyBillWave, FaUserMd, FaStethoscope } from "react-icons/fa";
import BillingInterval from "./BillingInterval";
import Specialization from "./Specialization";

const MasterPage = () => {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <div className="min-h-screen bg-offwhite p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition ${
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
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition ${
              activeTab === "our-services"
                ? "bg-darkgreen text-white"
                : "bg-white shadow"
            }`}
          >
            <FaStethoscope />
            Our Services
          </button>

          {/* [Imran - 10/11/2026]: Our Resources tab for navbar resources configuration */}
          <button
            onClick={() => setActiveTab("our-resources")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition ${
              activeTab === "our-resources"
                ? "bg-darkgreen text-white"
                : "bg-white shadow"
            }`}
          >
            <BookOpen size={16} />
            Our Resources
          </button>

          <button
            onClick={() => setActiveTab("specialization")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition ${
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
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition ${
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
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition ${
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
          {activeTab === "our-resources" && <OurResources />}
          {activeTab === "specialization" && <Specialization />}
          {activeTab === "tags" && <TagArticle />}
          {activeTab === "billing" && <BillingInterval />}
        </div>
      </div>
    </div>
  );
};

export default MasterPage;
