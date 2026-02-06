import React, { useState } from "react";
import CreateRole from "./CreateRole";
import ViewRole from "./ViewRole";
import PermissionView from "./PermissionView";
import CreatePermission from "./CreatePermission";
import Croleper from "./CreateRP";

const RoleTab = () => {
  const [activeTab, setActiveTab] = useState("view");

  return (
    <div className="p-4 md:p-6 ">
      <div className="flex gap-6 mb-6">
        {/* <button
          onClick={() => setActiveTab("create")}
          className={`pb-2 text-sm font-medium transition ${
            activeTab === "create"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Create Role
        </button> */}
{/* 
         <button
          onClick={() => setActiveTab("createpermission")}
          className={`pb-2 text-sm font-medium transition ${
            activeTab === "createpermission"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Create Permission
        </button> */}

        <button
          onClick={() => setActiveTab("view")}
          className={`pb-2 text-sm font-medium transition ${
            activeTab === "view"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          View Role & Access
        </button>

         {/* <button
          onClick={() => setActiveTab("permission")}
          className={`pb-2 text-sm font-medium transition ${
            activeTab === "permission"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Permission View
        </button> */}

         <button
          onClick={() => setActiveTab("create")}
          className={`pb-2 text-sm font-medium transition ${
            activeTab === "create"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          create role with permission
        </button>
      </div>

      {/* {activeTab === "create" && <CreateRole />} */}
      {activeTab === "view" && <ViewRole />}
      {/* {activeTab === "permission" && <PermissionView />}
       {activeTab === "createpermission" && <CreatePermission />} */}
          {activeTab === "create" && <Croleper />}
    </div>
  );
};

export default RoleTab;
