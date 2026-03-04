import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import CreateRP from "./CreateRoleandPermission";
import { api } from "../../utils/api.js";

const ViewRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api(`/api/role/all`);


        setRoles(data.roles || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleEdit = (id) => {
    const roleToEdit = roles.find((r) => r._id === id);
    setEditingRole(roleToEdit);
  };

  return (
    <div className="bg-secondary p-4">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">View Roles</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="px-4 py-3 rounded-l-lg">Role Name</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3 rounded-r-lg text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
              {roles.map((role) => (
                <tr
                  key={role._id}
                  className="border-b last:border-none hover:bg-gray-50 align-top"
                >
                  <td className="px-4 py-4 font-semibold">{role.role}</td>

                  <td className="px-4 py-4">
                    <div className="space-y-3">
                      {role.permissions.map((perm) => (
                        <div
                          key={perm.module}
                          className="grid grid-cols-[160px_1fr] items-start"
                        >
                          <span className="font-medium capitalize text-gray-800">
                            {perm.module}
                          </span>

                          <div className="flex flex-wrap gap-2">
                            {perm.actions.map((action) => (
                              <span
                                key={action}
                                className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="">
                      <button
                        onClick={() => handleEdit(role._id)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {/* <button className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                        <FiTrash2 size={16} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editingRole && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <CreateRP
                  mode="edit"
                  roleData={editingRole}
                  onClose={() => setEditingRole(null)}
                  onSuccess={() => {
                    setEditingRole(null);
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          )}

          {roles.length === 0 && (
            <p className="text-center text-gray-500 py-6">No roles found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRole;
