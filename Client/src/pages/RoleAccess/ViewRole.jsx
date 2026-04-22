import React, { useState, useEffect } from "react";
import { FiEdit2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import CreateRP from "./CreateRoleandPermission";
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

  return (
    <div className="bg-secondary p-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-outerheader mb-6">
          Role Management
        </h2>

        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role._id}
              className="border rounded-xl overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center px-5 py-4 bg-offwhite hover:bg-white transition">
                <div
                  className="flex items-center gap-3 cursor-pointer w-full"
                  onClick={() => toggleRow(role._id)}
                >
                  <span className="font-semibold text-gray-800">
                    {role.role}
                  </span>

                  {expandedRow === role._id ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </div>

                <button
                  onClick={() => handleEdit(role._id)}
                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                >
                  <FiEdit2 size={16} />
                </button>
              </div>

              {/* EXPANDED PERMISSIONS */}
              {expandedRow === role._id && (
                <div className="p-5 border-t bg-white">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2 ">
                    {role.permissions.map((perm) => (
                      <div
                        key={perm.module}
                        className="border-greenmuted/20  rounded-3xl p-4 bg-darkgreen hover:shadow-sm transition"
                      >
                        <h4 className="font-semibold text-white mb-3 capitalize">
                          {perm.module}
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {perm.actions.map((action) => (
                            <span
                              key={action}
                              className="px-2 py-1 text-xs rounded-full bg-yellow text-black"
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
          <p className="text-center text-gray-500 py-6">No roles found</p>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CreateRP
              mode="edit"
              roleData={editingRole}
              onClose={() => setEditingRole(null)}
              onSuccess={() => {
  setEditingRole(null);
  fetchRoles();
}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRole;