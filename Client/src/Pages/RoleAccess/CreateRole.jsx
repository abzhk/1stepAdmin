// import React, { useState, useEffect } from "react";

// const CreateRole = () => {
//   const [permissions, setPermissions] = useState([]);
//   const [role, setRole] = useState("");

//   const [selectedPermissions, setSelectedPermissions] = useState([]);
//   const [search, setSearch] = useState("");

//   const [popup, setPopup] = useState(false);
//   const [newPermission, setNewPermission] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchPermissions = async () => {
//       try {
//         setLoading(true);

//         const response = await fetch(
//           "http://localhost:3001/api/permission/all"
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Failed to fetch permissions");
//         }

//         setPermissions(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPermissions();
//   }, []);

//   const handleAddPermission = async () => {
//     if (!newPermission.trim()) return;

//     try {
//       const res = await fetch("http://localhost:3001/api/permission/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ permissionType: newPermission }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       setPermissions((prev) => [...prev, data.permission]);

//       setNewPermission("");
//       setPopup(false);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const filteredPermissions = permissions.filter(
//     (p) =>
//       p.permissionType.toLowerCase().includes(search.toLowerCase()) &&
//       !selectedPermissions.includes(p.permissionType)
//   );

//   const addPermission = (permission) => {
//     setSelectedPermissions((prev) => [...prev, permission.permissionType]);
//   };

//   const removePermission = (permissionType) => {
//     setSelectedPermissions(
//       selectedPermissions.filter((p) => p !== permissionType)
//     );
//   };

//   const handleCreateRole = async () => {
//     if (!role.trim() || selectedPermissions.length === 0) {
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:3001/api/role/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           role: role,
//           permissions: selectedPermissions,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       setRole("");
//       setSelectedPermissions([]);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   return (
//     <div className=" bg-offwhite p-4 md:p-6">
//       <div className=" flex items-center justify-center  ">
//         <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
//           <div className="flex items-center justify-between border-b pb-4 ">
//             <h2 className="text-xl font-semibold text-darkgreen mb-6">
//               Create Role
//             </h2>
//             <button
//               className="mb-4 px-4 py-2 bg-button text-white rounded-lg hover:bg-lightbutton"
//               onClick={() => setPopup(true)}
//             >
//               + Add Permission
//             </button>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Role Name
//             </label>
//             <input
//               type="text"
//               placeholder="Enter role name"
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               className="w-full rounded-lg border px-3 py-2"
//             />
//           </div>

//           <div className="mb-4 relative">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Add Permissions
//             </label>

//             <input
//               type="text"
//               placeholder="Search permission..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring- outline-none"
//             />

//             {search && filteredPermissions.length > 0 && (
//               <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-md max-h-40 overflow-y-auto">
//                 {filteredPermissions.map((perm) => (
//                   <div
//                     key={perm._id}
//                     onClick={() => addPermission(perm)}
//                     className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
//                   >
//                     {perm.permissionType}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="mb-6">
//             <p className="text-sm font-medium text-gray-700 mb-2">
//               Selected Permissions
//             </p>

//             <div className="flex flex-wrap gap-2">
//               {selectedPermissions.map((perm) => (
//                 <span
//                   key={perm}
//                   className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
//                 >
//                   {perm}
//                   <button
//                     onClick={() => removePermission(perm)}
//                     className="text-green-700 hover:text-red-500"
//                   >
//                     ×
//                   </button>
//                 </span>
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-end gap-3">
//             <button className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">
//               Cancel
//             </button>
//             <button
//               className="px-4 py-2 rounded-lg bg-button text-white hover:bg-lightbutton"
//               onClick={handleCreateRole}
//             >
//               Create Role
//             </button>
//           </div>
//         </div>

//         {popup && (
//           <div className="fixed bg-offwhite  w-90 flex items-center justify-center z-50 ">
//             <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
//               <h3 className="text-lg font-semibold mb-4">Add Permission</h3>

//               <input
//                 type="text"
//                 placeholder="Enter permission name"
//                 className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-green-500 outline-none"
//                 value={newPermission}
//                 onChange={(e) => setNewPermission(e.target.value)}
//               />

//               <div className="flex justify-end gap-3">
//                 <button
//                   className="px-4 py-2 border rounded-lg text-gray-700"
//                   onClick={() => setPopup(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 bg-button text-white rounded-lg hover:bg-lightbutton"
//                   onClick={handleAddPermission}
//                 >
//                   Add
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {loading && <p className="text-center mt-4">Loading permissions...</p>}
//         {error && <p className="text-red-500 mt-4">{error}</p>}
//       </div>
//     </div>
//   );
// };

// export default CreateRole;
