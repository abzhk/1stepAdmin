import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ACTIONS = ["read", "create", "update", "delete", "export"];

const CreateRoleandPermission = ({ mode = "create", roleData,userId,  onClose, onSuccess }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [defaultModules, setDefaultModules] = useState([
  ]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modules, setModules] = useState([]);
// const [selectedModules, setSelectedModules] = useState([]);

const API = import.meta.env.VITE_API_URL;


const fetchModules = async () => {
  try {
    const res = await fetch(`${API}/api/module/get-module`, {
      credentials: "include",
    });
    const data = await res.json();
    setModules(data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchModules();
}, []);

  const buildPermissions = (rolePerms = [], override = []) => {
  const map = {};

  rolePerms.forEach((p) => {
    map[p.module] = [...p.actions];
  });

  override.forEach((o) => {
    map[o.module] = [...o.actions];
  });

  return map;
};


  const resetForm = () => {
    setRoleName("");
    setDescription("");
    setIsSuperAdmin(false);
    setDefaultModules(["dashboard", "profile"]);
    setPermissions({});
    setError("");
  };

const AUTO_ACTIONS = ["read", "create","update","delete","export"];

const toggleDefaultModule = (module) => {
  setDefaultModules((prev) => {
    const isSelected = prev.includes(module);

    setPermissions((perms) => {
      const updated = { ...perms };

      if (!isSelected) {
        updated[module] = updated[module]
          ? Array.from(new Set([...updated[module], ...AUTO_ACTIONS]))
          : [...AUTO_ACTIONS];
      } else {
        delete updated[module];
      }

      return updated;
    });

    return isSelected
      ? prev.filter((m) => m !== module)
      : [...prev, module];
  });
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
  const API = import.meta.env.VITE_API_URL;

  try {
    setLoading(true);

    const formattedPermissions = Object.entries(permissions).map(
      ([module, actions]) => ({ module, actions })
    );

    if (mode === "user") {
      const res = await fetch(
        `${API}/api/access/user/${userId}/override`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: formattedPermissions }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("User permissions updated");
      onSuccess?.();
      return; 
    }
    if (!roleName.trim()) return;

    const payload = {
      description,
      defaultModules,
      permissions: isSuperAdmin ? [] : formattedPermissions,
    };

    const url =
      mode === "edit"
        ? `${API}/api/role/${roleName}`
        : `${API}/api/role/roles`;

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

useEffect(() => {
  if (mode !== "user" || !roleData) return;

  setRoleName(roleData.userRef.username);
  setDescription(roleData.userRef.email);
  setIsSuperAdmin(roleData.userRef.role.isSuperAdmin || false);
  setDefaultModules(roleData.userRef.role.defaultModules || []);

  const perms = buildPermissions(
    roleData.userRef.role.permissions,
    roleData.userRef.permissionsOverride
  );

  setPermissions(perms);
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
         <input
  placeholder="Role name "
  value={roleName}
  disabled={mode === "edit"|| mode === "user"}
  onChange={(e) =>
    setRoleName(
      e.target.value.toLowerCase().replace(/\s+/g, "_")
    )
  }
  className="border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
/>


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
    {modules.map((m) => (
      <button
        key={m._id}
        type="button"
        onClick={() => toggleDefaultModule(m.modules)}
        className={`px-3 py-1 rounded-full text-sm border transition ${
          defaultModules.includes(m.modules)
            ? "bg-yellow text-white"
            : "bg-white hover:bg-gray-50"
        }`}
      >
        {m.modules}
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
              {modules.map((m) => (
               <tr key={m._id} className="border-t">
                 <td className="p-2 font-medium">{m.modules}</td>
              {ACTIONS.map((a) => (
                   <td key={a} className="text-center">
                 <input
                   type="checkbox"
                    checked={permissions[m.modules]?.includes(a) || false}
                  onChange={() => togglePermission(m.modules, a)}
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

export default CreateRoleandPermission;
