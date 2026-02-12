import React, { useState } from "react";
import CreateRoleandPermission from "./CreateRoleandPermission";

const RolebyAccessView = () => {
  const API = import.meta.env.VITE_API_URL;

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = async () => {
    if (!q.trim()) return;

    const res = await fetch(`${API}/api/access/search?q=${q}`, {
      credentials: "include",
    });

    const data = await res.json();
    setResults(data.results || []);
  };

  const openUser = async (type, profileId) => {
    const url =
      type === "parent"
        ? `${API}/api/access/parent/${profileId}`
        : `${API}/api/access/provider/${profileId}`;

    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();

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
    <div className="p-6 space-y-6">
      <div className="flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search user"
          className="border px-9 py-2 rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-peach text-white rounded-lg"
        >
          Search
        </button>

         <button
           onClick={handleCancel}
          className="px-4 py-2 bg-peach text-white rounded-lg"
        >
          Cancel
        </button>
      </div>

      {results.map((r) => (
        <div
          key={r.profileId}
          className="flex justify-between border p-3 rounded-lg"
        >
          <div>
            <p className="font-semibold">{r.username}<span className=" ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">  {r.role}</span></p>
            <p className="text-sm">{r.email}</p>
          
          </div>

          <button
            onClick={() => openUser(r.type, r.profileId)}
            className="px-3 py-1 bg-peach text-white rounded"
          >
            Manage
          </button>
        </div>
      ))}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-auto rounded-xl">
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
  );
};

export default RolebyAccessView;
