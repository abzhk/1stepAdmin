import React, { useState } from "react";
import CreateRoleandPermission from "./CreateRoleandPermission.jsx";
import {api} from "../../utils/api.js"

const RolebyAccessView = () => {

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = async () => {
    if (!q.trim()) return;

    const data = await api(`/api/access/search?q=${q}`, {
    });

    setResults(data.results || []);
  };

  const openUser = async (type, profileId) => {
    const endpoint =
      type === "parent"
        ? `/api/access/parent/${profileId}`
        : `/api/access/provider/${profileId}`;

    const data = await api(endpoint);

    if (data.success) {
      setSelectedUser(data.data);
    }
  };

  const handleCancel = () => {
  setQ("");
  setResults([]);
  setSelectedUser(null);
};


 return (
  <div className="p-6 min-h-screen bg-white rounded-3xl">
    <div className=" p-4 space-y-6 rounded-3xl bg-offwhite">
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-darkgreen">
          User Access Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Search and manage individual user permissions
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username or email..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow"
          />

          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-peach text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Search
          </button>

          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((r) => (
          <div
            key={r.profileId}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-semibold text-darkgreen text-lg">
                  {r.username}
                </h2>

                <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                  {r.role}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {r.email}
              </p>
            </div>

            <button
              onClick={() => openUser(r.type, r.profileId)}
              className="px-5 py-2.5 bg-peach text-white rounded-xl font-medium hover:opacity-90 transition"
            >
              Manage Access
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {results.length === 0 && q && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
          No users found
        </div>
      )}

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-auto rounded-3xl shadow-2xl">
            <CreateRoleandPermission
              mode="user"
              roleData={selectedUser}
              userId={selectedUser.userRef._id}
              onClose={() => setSelectedUser(null)}
              onSuccess={() => setSelectedUser(null)}
            />
          </div>
        </div>
      )}

    </div>
    </div>
  </div>
);
};

export default RolebyAccessView;
