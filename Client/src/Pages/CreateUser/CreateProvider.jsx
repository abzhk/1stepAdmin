import React, { useState } from "react";

const CreateProvider = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roleType: "Provider",
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
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create provider");

      setSuccess("Provider created successfully");
      setFormData({
        username: "",
        email: "",
        password: "",
        roleType: "Provider",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-6">Create Provider</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Role (Fixed) */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Role</label>
          <select
            disabled
            className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          >
            <option>Provider</option>
          </select>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Enter username"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Enter email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Enter password"
          />
        </div>

        {/* Messages */}
        {(error || success) && (
          <div className="md:col-span-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </div>
        )}

        {/* Submit */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-8 py-2 rounded-md disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Provider"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProvider;
