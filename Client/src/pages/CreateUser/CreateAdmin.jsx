import React, { useState } from "react";
import toast from "react-hot-toast";


const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/admin/create-admin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Admin created successfully");
      setFormData({ username: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" w-full bg-offwhite flex justify-center items-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
        
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-800">
            Create Admin
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Role
            </label>
            <select
              disabled
              className="w-full border border-gray-200 bg-offwhite rounded-xl px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              <option>Admin</option>
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full border border-gray-200 bg-offwhite rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            
              placeholder="Enter email"
              className="w-full border border-gray-200 bg-offwhite rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border border-gray-200 bg-offwhite rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          {(error || success) && (
            <div className="md:col-span-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-peach text-white font-medium px-10 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
