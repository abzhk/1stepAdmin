import React, { useState, useEffect } from "react";
import { FiEdit2, FiChevronDown, FiChevronUp, FiShield } from "react-icons/fi";
import CreateRP from "./CreateRoleandPermission.jsx";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";

const ViewRole = () => {
  const [roles, setRoles] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  const fetchRoles = async () => {
    const data = await api(`/api/role/all`);
    setRoles(data.roles || []);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleEdit = (id) => {
    const roleToEdit = roles.find((r) => r._id === id);
    setEditingRole(roleToEdit);
  };

  // Count total permissions
  const getTotalPermissions = (permissions) => {
    return permissions.reduce((total, perm) => total + perm.actions.length, 0);
  };

  return (
    <div className="bg-offwhite min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-darkgreen/10 rounded-xl">
              <FiShield className="text-darkgreen text-2xl" />
            </div>
            <h1 className="text-outerheader">Role Management</h1>
          </div>
          <p className="text-cardfooter ml-12">
            Manage roles and their permissions across the system
          </p>
        </div>

        {/* Roles List */}
        <div className="bg-white rounded-2xl shadow-sm border border-greenmuted/10 overflow-hidden">
          <div className="p-6 border-b border-greenmuted/10">
            <h2 className="text-subheading">All Roles</h2>
          </div>

          <div className="divide-y divide-greenmuted/10">
            {roles.map((role) => (
              <div key={role._id} className="transition-all duration-200">
                {/* HEADER */}
                <div 
                  className={`flex justify-between items-center px-6 py-4 cursor-pointer transition-all duration-200 ${
                    expandedRow === role._id 
                      ? 'bg-darkgreen/5 border-l-4 border-darkgreen' 
                      : 'hover:bg-offwhite/50'
                  }`}
                >
                  <div
                    className="flex items-center gap-4 flex-1"
                    onClick={() => toggleRow(role._id)}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-darkgreen/10 text-darkgreen">
                      <span className="font-bold text-sm">
                        {role.role.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800 text-lg">
                        {role.role}
                      </span>
                      {/* <span className="ml-3 text-cardfooter text-sm">
                        {getTotalPermissions(role.permissions)} permissions
                      </span> */}
                    </div>
                    <div className="text-greenmuted">
                      {expandedRow === role._id ? (
                        <FiChevronUp size={20} />
                      ) : (
                        <FiChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(role._id)}
                    className="p-2.5 rounded-xl text-darkgreen hover:bg-darkgreen/10 transition-all duration-200 group"
                  >
                    <FiEdit2 size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* EXPANDED PERMISSIONS */}
                {expandedRow === role._id && (
                  <div className="px-6 py-5 bg-offwhite/30 border-t border-greenmuted/10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                      {role.permissions.map((perm) => (
                        <div
                          key={perm.module}
                          className="bg-white rounded-xl p-5 border border-greenmuted/50 hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-8 bg-darkgreen rounded-full"></div>
                            <h4 className="font-semibold text-darkgreen capitalize text-base">
                              {perm.module}
                            </h4>
                            <span className="ml-auto text-xs text-yellow text-tab-subheading bg-darkgreen px-2 py-1 rounded-full">
                              {perm.actions.length}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {perm.actions.map((action) => (
                              <span
                                key={action}
                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-yellow/50 text-darkgreen border border-yellow/20 hover:bg-yellow/20 transition-colors"
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {roles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No roles found</p>
              <p className="text-cardfooter text-sm mt-1">Create your first role to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CreateRP
              mode="edit"
              roleData={editingRole}
              onClose={() => setEditingRole(null)}
              onSuccess={() => {
                setEditingRole(null);
                fetchRoles();
                toast.success('Role updated successfully!');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRole;