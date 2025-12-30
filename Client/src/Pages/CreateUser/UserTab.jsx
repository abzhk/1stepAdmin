import React, { useState } from "react";
import CreateAdmin from "./CreateAdmin";
import CreateUser from "./CreateUser";
import CreateProvider from "./CreateProvider";

const tabs = [
  { key: "admin", label: "Create Admin" },
  { key: "user", label: "Create Parent" },
  { key: "provider", label: "Create Provider" },
];

const UserTab = () => {
  const [activeTab, setActiveTab] = useState("admin");

  const renderContent = () => {
    switch (activeTab) {
      case "admin":
        return <CreateAdmin />;

      case "user":
        return <CreateUser />;

      case "provider":
        return <CreateProvider />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 text-sm font-medium transition
              ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
};

export default UserTab;
