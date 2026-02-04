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

const ROLES = {
  PARENT: "Parent",
  PROVIDER: "Provider",
  ADMIN: "Admin",
};

const CreateRP = ({ mode = "create", roleData, onClose, onSuccess }) => {
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
      ([module, actions]) => ({ module, actions })
    );

    const payload = {
      description,
      defaultModules,
      permissions: isSuperAdmin ? [] : formattedPermissions,
    };

    const url =
      mode === "edit"
        ? `http://localhost:3001/api/role/${roleName}`
        : "http://localhost:3001/api/role/roles";

    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "edit" ? payload : { role: roleName, ...payload }
      ),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert(mode === "edit" ? "Role updated" : "Role created");

    onSuccess?.();
    if (mode === "create") resetForm();
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  if (mode === "edit" && roleData) {
    setRoleName(roleData.role);
    setDescription(roleData.description || "");
    setIsSuperAdmin(roleData.isSuperAdmin || false);
    setDefaultModules(roleData.defaultModules || []);

    // permissions array → object
    const perms = {};
    roleData.permissions?.forEach((p) => {
      perms[p.module] = p.actions;
    });
    setPermissions(perms);
  }
}, [mode, roleData]);


  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-8">
      <div className="flex justify-between items-center">
  <h1 className="text-2xl font-semibold text-gray-800">
    {mode === "edit" ? "Edit Role" : "Create Role"}
  </h1>

  {onClose && (
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 text-xl"
    >
      ✕
    </button>
  )}
</div>

        <div className="grid md:grid-cols-2 gap-6">
          <select
  value={roleName}
  disabled={mode === "edit"}
  onChange={(e) => setRoleName(e.target.value)}
  className="border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
>
            <option value="" disabled>
              Select role
            </option>

            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
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
        {/* <div className="flex justify-end"> */}

          <div className="flex justify-end gap-3">
  {onClose && (
    <button
      type="button"
      onClick={onClose}
      className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
    >
      Cancel
    </button>
  )}
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
