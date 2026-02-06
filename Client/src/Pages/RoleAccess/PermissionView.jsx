// import React, { useState, useEffect } from "react";

// const PermissionView = () => {
//   const [permissions, setPermissions] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         const roleRes = await fetch("http://localhost:3001/api/role/all");
//         const roleData = await roleRes.json();

//         const permRes = await fetch("http://localhost:3001/api/permission/all");
//         const permData = await permRes.json();

//         if (!roleRes.ok)
//           throw new Error(roleData.message || "Failed to fetch roles");
//         if (!permRes.ok)
//           throw new Error(permData.message || "Failed to fetch permissions");

//         setRoles(roleData.roles || []);
//         setPermissions(permData || []);
//         setSelectedRole(roleData.roles?.[0] || null);
//       } catch (err) {
//         setError(err.message || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const hasPermission = (permissionType) => {
//     return selectedRole.permissions.includes(permissionType);
//   };

//   const togglePermission = async (permissionType) => {
//     const exists = selectedRole.permissions.includes(permissionType);

//     await fetch("http://localhost:3001/api/permission/update-permissions", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         roleId: selectedRole._id,
//         permissionType,
//         action: exists ? "remove" : "add",
//       }),
//     });

//     const res = await fetch("http://localhost:3001/api/role/all");
//     const data = await res.json();

//     const updatedRole = data.roles.find((r) => r._id === selectedRole._id);
//     setSelectedRole(updatedRole);
//   };

//   if (loading) {
//     return <p className="p-6 text-gray-600">Loading permissions...</p>;
//   }

//   if (error) {
//     return <p className="p-6 text-red-600">{error}</p>;
//   }

//   if (!selectedRole) {
//     return <p className="p-6 text-gray-600">No roles found.</p>;
//   }

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-sm space-y-4">
//       <div className="flex items-center gap-3">
//         <label className="text-sm font-medium text-gray-700">
//           Select Role:
//         </label>

//         <select
//           value={selectedRole._id}
//           onChange={(e) => {
//             const role = roles.find((r) => r._id === e.target.value);
//             setSelectedRole(role);
//           }}
//           className="border rounded-md px-3 py-2 text-sm focus:outline-none"
//         >
//           {roles.map((role) => (
//             <option key={role._id} value={role._id}>
//               {role.role}
//             </option>
//           ))}
//         </select>
//       </div>

//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="border-b bg-gray-50">
//             <th className="text-left p-3 w-3/4">Permissions</th>
//             <th className="text-center p-3">{selectedRole.role}</th>
//           </tr>
//         </thead>

//         <tbody>
//           {permissions.map((perm) => (
//             <tr key={perm._id} className="border-b">
//               <td className="p-3 text-sm text-gray-700">
//                 {perm.permissionType}
//               </td>

//               <td className="text-center p-3">
//                 <input
//                   type="checkbox"
//                   checked={hasPermission(perm.permissionType)}
//                   onChange={() => togglePermission(perm.permissionType)}
//                   className="h-4 w-4 accent-violet-600"
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   ); 
// };

// export default PermissionView;
