import React, { useState, useRef,useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../../utils/api.js";
import { storage } from "../../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaCamera, FaUser } from "react-icons/fa";

const CreateAdmin = () => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profilePicture: "",
      role: "",  
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
const [limit] = useState(10);
const [totalPages, setTotalPages] = useState(1);
const [search, setSearch] = useState("");


  const fetchUsers = async () => {
  try {
    const res = await api(
      `/api/users/users?page=${page}&limit=${limit}&search=${search}`
    );

    if (res.success) {
      setUsers(res.users);
      setTotalPages(res.pagination.totalPages);
    }
  } catch (err) {
    toast.error("Failed to load users");
  }
};

useEffect(() => {
  fetchUsers();
}, [page, search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    uploadImage(file);
  };

  const uploadImage = (file) => {
    setUploading(true);

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, "adminProfiles/" + fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      () => {
        toast.error("Image upload failed");
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({
            ...prev,
            profilePicture: downloadURL,
          }));
          toast.success("Image uploaded");
          setUploading(false);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/api/admin/create-admin", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to create admin");
      }

      toast.success("Admin created successfully");

      setFormData({
        username: "",
        email: "",
        password: "",
        profilePicture: "",
          role: "",  
      });

      setImagePreview(null);
    } catch (err) {
      toast.error(err.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const fetchRoles = async () => {
    try {
      const res = await api("/api/admin/getroles");
      if (res.success) {
        setRoles(res.roles);
      }
    } catch (err) {
      toast.error("Failed to load roles");
    }
  };

  fetchRoles();
}, []);

  return (
    <div className="min-h-screen bg-Offwhite p-6 flex items-center justify-center">
      <div className="w-full ">

        {/* CARD */}
         <div className="w-full relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-[#8fa797]/10">
      <div className=" w-full bg-offwhite p-6 shadow-xl shadow-[#8fa797]/10">
      <div className="w-full bg-white rounded-2xl">

          {/* HEADER */}
          <div className="relative flex flex-col items-center pb-8">
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-[#2d4a36] to-[#426b50] rounded-t-2xl" />

            {/* AVATAR */}
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative z-10 mt-16 h-32 w-32 cursor-pointer"
            >
              <div className="h-full w-full rounded-full border-4 border-white overflow-hidden shadow-lg flex items-center justify-center bg-gray-100">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-400 text-3xl" />
                )}
              </div>

              {/*ICON */}
              <div className="absolute bottom-1 right-1 bg-yellow-400 text-[#2d4a36] p-2 rounded-full shadow">
                <FaCamera size={14} />
              </div>
            </div>

            <h2 className="mt-4 text-tabheading uppercase">
              Create Admin
            </h2>
            <p className="text-tab-subtext">
              Add a new administrator account
            </p>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {uploading && (
              <p className="text-sm text-gray-500 mt-2">
                Uploading... {progress.toFixed(0)}%
              </p>
            )}
          </div>

          {/* FORM */}
          <div className="px-6 pb-10 pt-4 md:px-12">
            <form onSubmit={handleSubmit}>

              {/* ROLE */}
             <div className="mb-6">
  <label className="mb-2 block text-label">
    Role
  </label>

  <select
    name="role"
    value={formData.role}
    onChange={handleChange}
    className="w-full rounded-xl border-2 border-greenmuted p-3"
  >
    <option value="">Select Role</option>

    {roles.map((r) => (
      <option key={r._id} value={r.role}>
        {r.role}
      </option>
    ))}
  </select>
</div>

              {/* GRID */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* USERNAME */}
                <div>
                  <label className="mb-2 block text-label">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-greenmuted p-3 focus:outline-none focus:ring-2 focus:ring-yellow"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-greenmuted p-3 focus:outline-none focus:ring-2 focus:ring-yellow"
                  />
                </div>

                {/* PASSWORD */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-label">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-greenmuted p-3 focus:outline-none focus:ring-2 focus:ring-yellow"
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* BUTTON */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-[#2d4a36]  text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-60"
                >
                  {loading
                    ? "Creating..."
                    : uploading
                    ? "Uploading Image..."
                    : "Create Admin"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      </div>
      {/* ROLES TABLE */}
<div className="mt-10">
  <h3 className="text-subheading mb-4">
    Existing Users
  </h3>
<div className="bg-white px-6 py-6 rounded-2xl shadow-md">
  <div className="overflow-x-auto rounded-xl border border-gray-200">
    <table className="w-full">
      <thead className="bg-offwhite">
        <tr>
          <th className="px-4 py-3">S.No</th>
          <th className="px-4 py-3">Profile</th>
          <th className="px-4 py-3">Username</th>
          <th className="px-4 py-3">Email</th>
          <th className="px-4 py-3">Role</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Created</th>
        </tr>
      </thead>

      <tbody>
        {users.length > 0 ? (
          users.map((user, index) => (
            <tr key={user._id} className="border-t hover:bg-offwhite">
              <td className="px-4 py-3">{(page - 1) * limit + index + 1}</td>

              <td className="px-4 py-3">
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </td>

              <td className="px-4 py-3">
                {user.username}
              </td>

              <td className="px-4 py-3">
                {user.email}
              </td>

              <td className="px-4 py-3">
                {user.role?.role || "No Role"}
              </td>

              <td className="px-4 py-3">
                {user.isActive ? (
                  <span className="text-green-600">
                    Active
                  </span>
                ) : (
                  <span className="text-red-600">
                    Inactive
                  </span>
                )}
              </td>

              <td className="px-4 py-3">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="7"
              className="text-center py-6 text-gray-500"
            >
              No users found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  </div>
</div>
<div className="flex justify-end items-end gap-3 mt-6">
  <button
    disabled={page === 1}
    onClick={() => setPage((prev) => prev - 1)}
    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
  >
    Previous
  </button>

  <span className="font-medium">
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage((prev) => prev + 1)}
    className="px-4 py-2 bg-[#2d4a36] text-white rounded disabled:opacity-50"
  >
    Next
  </button>
</div>
      </div>
      
    </div>
    
  );
};

export default CreateAdmin;