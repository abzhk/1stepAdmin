import React, { useEffect, useState } from "react";

const InactiveProvider = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const getInactiveProviders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/provider/inactive-providers`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed");

      console.log("Inactive Providers API Response:", data.providers);

      setProviders(data.providers || []);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    getInactiveProviders();
  }, []);


  const handleActive = async (providerId) => {
    try {
      const res = await fetch(
        `${API}/api/provider/admin/provider/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId,
            isActive: true,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProviders((prev) => prev.filter((p) => p._id !== providerId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (providerId) => {

    try {
      const res = await fetch(
        `${API}/api/admin/providers/${providerId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

       getInactiveProviders();
      setProviders((prev) => prev.filter((p) => p._id !== providerId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-offwhite">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Inactive Providers
      </h1>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : providers.length === 0 ? (
        <p className="text-gray-500">No inactive providers found</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-center">Activate</th>
                <th className="px-6 py-4 text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {providers.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.fullName}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.phone}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleActive(p._id)}
                      className="px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                    >
                      Activate
                    </button>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(p.userRef)}
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

export default InactiveProvider;
