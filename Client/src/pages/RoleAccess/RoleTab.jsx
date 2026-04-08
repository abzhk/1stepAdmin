import React, { useState } from "react";
import ViewRole from "./ViewRole";
import Createrole from "./CreateRoleandPermission";
import RolebyAccessView from "./RolebyAccessView";
import CreateModule from "./CreateModule";

const RoleTab = () => {
  const [activeTab, setActiveTab] = useState("view");

  const tabs = [
    { key: "view", label: "View Role & Access" },
    { key: "create", label: "Create Role" },
    { key: "RolebyAccess", label: "Parent & Provider View" },
    { key: "createmodule", label: "Create Module" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">

      <div className="sticky top-0 z-30 w-full pt-4 pb-2 px-4 backdrop-blur-sm">
        <div className="mx-auto max-w-fit rounded-full bg-white p-2 shadow-sm ">
          <nav className="flex items-center space-x-1">

            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative px-6 py-2.5 rounded-full text-sm font-semibold 
                    transition-all duration-300 ease-in-out whitespace-nowrap
                    ${isActive
                      ? "bg-darkgreen text-yellow shadow-md scale-100"
                      : "bg-transparent text-greenmuted hover:bg-offwhite hover:text-softpeach"
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}

          </nav>
        </div>
      </div>


      <div className="w-full mx-auto px-4 mt-1 pb-20">
        <div className="">

          {activeTab === "view" && <ViewRole />}
          {activeTab === "create" && <Createrole />}
          {activeTab === "RolebyAccess" && <RolebyAccessView />}
          {activeTab === "createmodule" && <CreateModule />}

        </div>
      </div>
    </div>
  );
};

export default RoleTab;