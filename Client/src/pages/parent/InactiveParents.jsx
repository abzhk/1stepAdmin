import React, { useEffect, useState } from "react";

const InacticeParents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const getInactiveParents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/parent/inactive-parents`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed");

      // filter inactive
      const inactive = (data.parents || []).filter(
        (p) => !p.userRef?.isActive
      );

      setParents(inactive);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getInactiveParents();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this parent?")) return;

    try {
      const res = await fetch(`${API}/api/admin/parent/user/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setParents((prev) => prev.filter((p) => p.userRef?._id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-offwhite">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Inactive Parents
      </h1>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : parents.length === 0 ? (
        <p className="text-gray-500">No inactive parents found</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Parent Name</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {parents.map((p) => (
                <tr
                  key={p._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.parentDetails?.fullName}
                  </td>
                   <td className="px-6 py-4 font-medium text-gray-900">
                    {p.parentDetails?.phoneNumber}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                      Inactive
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(p.userRef?._id)}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InacticeParents;
