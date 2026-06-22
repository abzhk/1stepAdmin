import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import{api} from "../../utils/api.js"

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



const fetchModules = async () => {
  try {
    const data = await api(`/api/module/get-module`);
    
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
          setDefaultModules((prevModules) => {
      if (updated.length > 0) {
      
        if (!prevModules.includes(module)) {
          return [...prevModules, module];
        }
        return prevModules;
      } else {
        // If no permissions remain, remove module
        return prevModules.filter((m) => m !== module);
      }
    });

      if (updated.length === 0) {
        const clone = { ...prev };
        delete clone[module];
        return clone;
      }

      return { ...prev, [module]: updated };
    });
  };

 const handleSubmit = async () => {

  try {
    setLoading(true);

    const formattedPermissions = Object.entries(permissions).map(
      ([module, actions]) => ({ module, actions })
    );

    if (mode === "user") {
      await api(
        `/api/access/user/${userId}/override`,
        {
          method: "PUT",
          body: JSON.stringify({ permissions: formattedPermissions }),
        }
      );

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

    const endpoint =
      mode === "edit"
        ? `/api/role/${roleName}`
        : `/api/role/roles`;

    const method = mode === "edit" ? "PUT" : "POST";

    await api(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "edit" ? payload : { role: roleName, ...payload }
      ),
    });

    

    toast.success(mode === "edit" ? "Role updated" : "Role created");

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

  const mergedPermissions = buildPermissions(
    roleData.userRef.role.permissions,
    roleData.userRef.permissionsOverride
  );

  setPermissions(mergedPermissions);

  setDefaultModules(Object.keys(mergedPermissions));

}, [mode, roleData]);



  return (
  <div className="min-h-screen bg-white rounded-3xl p-6 overflow-hidden">
        <div className="max-w-full mx-auto bg-white rounded-3xl border border-gray-100 shadow-lg p-8 space-y-8">
     <div className="flex justify-between items-center pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-darkgreen">
            {mode === "edit" ? "Edit Role" : "Create Role"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure role modules and access permissions
          </p>
        </div>

  {onClose && (
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 text-xl"
    >
      ✕
    </button>
  )}
</div>

      <div className="grid md:grid-cols-2 gap-5">
  
  <div className="space-y-2">
    <label className="text-label">
      Role Name
    </label>
    <input
      placeholder="Enter role name"
      value={roleName}
      disabled={mode === "edit" || mode === "user"}
      onChange={(e) =>
        setRoleName(
          e.target.value.toLowerCase().replace(/\s+/g, "_")
        )
      }
      className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow disabled:bg-gray-100"
    />
  </div>

  <div className="space-y-2">
    <label className="text-label">
      Description
    </label>
    <input
      placeholder="Enter description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow"
    />
  </div>

</div>

        {/* DEFAULT MODULES */}
       <div className="bg-offwhite/90 rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-darkgreen mb-4">
          Default Modules
        </h2>

        <div className="flex flex-wrap gap-3">
          {modules.map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => toggleDefaultModule(m.modules)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                defaultModules.includes(m.modules)
                  ? "bg-yellow text-darkgreen border-yellow shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
            <thead className="bg-offwhite text-cardfooter uppercase ">
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
               <tr key={m._id} className="hover:bg-offwhite/60 transition-colors duration-200">
                 <td className="p-2 font-medium">{m.modules}</td>
              {ACTIONS.map((a) => (
                   <td key={a} className="text-center">
                  <input
                          type="checkbox"
                          checked={
                            permissions[m.modules]?.includes(a) || false
                          }
                          onChange={() =>
                            togglePermission(m.modules, a)
                          }
                          className="w-4 h-4 accent-yellow cursor-pointer"
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
      className="px-5 py-2 rounded-lg border bg-yellow border-gray-300 text-gray-700 hover:bg-gray-100"
    >
      Cancel
    </button>
  )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-darkgreen text-white rounded-lg"
          >
            {loading ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoleandPermission;
