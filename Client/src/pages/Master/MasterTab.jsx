import React, { useState } from "react";
import MasterData from "./MasterData";  
import TagArticle from "./TagArticle";   
import { FaCogs, FaTags } from "react-icons/fa";

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
        </div>

        <div>
          {activeTab === "services" && <MasterData />}
          {activeTab === "tags" && <TagArticle />}
        </div>

      </div>
    </div>
  );
};

export default MasterPage;