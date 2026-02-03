import React, { useEffect, useState } from "react";

const MODULES = [
  "dashboard",
  "profile",
  "patients",
  "messages",
  "assessment",
  "appointments",
  "video_sessions",
  "reports",
  "billing",
  "resource_library",
  "settings",
];

const ACTIONS = ["read", "create", "update", "delete", "export"];

const CreateRP = ({}) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [defaultModules, setDefaultModules] = useState([
    "dashboard",
    "profile",
  ]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setRoleName("");
    setDescription("");
    setIsSuperAdmin(false);
    setDefaultModules(["dashboard", "profile"]);
    setPermissions({});
    setError("");
  };

  const toggleDefaultModule = (module) => {
    setDefaultModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module],
    );
  };

  const togglePermission = (module, action) => {
    setPermissions((prev) => {
      const current = prev[module] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];

      if (updated.length === 0) {
        const clone = { ...prev };
        delete clone[module];
        return clone;
      }

      return { ...prev, [module]: updated };
    });
  };

  const handleSubmit = async () => {
    if (!roleName.trim()) return;

    try {
      setLoading(true);

      const formattedPermissions = Object.entries(permissions).map(
        ([module, actions]) => ({
          module,
          actions,
        }),
      );

      const payload = {
        role: roleName.trim(),
        description,
        isSuperAdmin,
        defaultModules,
        permissions: isSuperAdmin ? [] : formattedPermissions,
      };

      const res = await fetch("http://localhost:3001/api/role/roles", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Role saved successfully");
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-8">
        <h1 className="text-2xl font-semibold text-gray-800">Create Role</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <select
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="" disabled>
              Select role
            </option>
            <option value="Parent">Parent</option>
            <option value="Provider">Provider</option>
            <option value="Admin">Admin</option>
          </select>

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {/* DEFAULT MODULES */}
        <div>
          <h2 className="font-semibold mb-2">Default Modules</h2>
          <div className="flex flex-wrap gap-2">
            {MODULES.map((m) => (
              <button
                key={m}
                onClick={() => toggleDefaultModule(m)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  defaultModules.includes(m)
                    ? "bg-yellow text-white"
                    : "bg-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* PERMISSIONS */}
        {!isSuperAdmin && (
          <table className="w-full border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Module</th>
                {ACTIONS.map((a) => (
                  <th key={a} className="p-2 text-center capitalize">
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m} className="border-t">
                  <td className="p-2 font-medium">{m}</td>
                  {ACTIONS.map((a) => (
                    <td key={a} className="text-center">
                      <input
                        type="checkbox"
                        checked={permissions[m]?.includes(a) || false}
                        onChange={() => togglePermission(m, a)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {/* ACTIONS */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-peach text-white rounded-lg"
          >
            {loading ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRP;
