import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const ViewRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:3001/api/role/all");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch roles");
        }

        setRoles(data.roles || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      }
    };
    fetchRoles();
  }, []);

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
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{role.role}</td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions?.map((perm, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-green-100 rounded-md"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50">
                        <FiEdit2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {roles.length === 0 && (
            <p className="text-center text-gray-500 py-6">No roles found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRole;
