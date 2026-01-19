import React, { useEffect, useState } from "react";

const CreatePermission = () => {
  const [permission, setPermission] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/permission/all");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch permissions");

      setPermissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!permission.trim()) return;

    try {
      const res = await fetch("http://localhost:3001/api/permission/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionType: permission }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPermission("");
      fetchPermissions();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-secondary p-4 ">

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-3xl mx-auto mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Create Permission
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter permission name"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2  outline-none"
          />

          <button
            onClick={handleAddPermission}
            className="px-4 py-2 rounded-lg bg-button text-white hover:bg-lightbutton"
          >
            Add
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-700 bg-red-100 border px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>


      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-3xl mx-auto">

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="px-4 py-3 rounded-l-lg">Permission List</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : permissions.length > 0 ? (
                permissions.map((permission) => (
                  <tr
                    key={permission._id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {permission.permissionType}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-4 text-center text-gray-500">
                    No permissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default CreatePermission;
