import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditProvider() {
  const { id } = useParams();  
  console.log(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    qualification: "",
    experience: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:3001/api/provider/providersbyid/${id}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch provider");
        }

        setFormData({
          fullName: data.provider.fullName || "",
          phone: data.provider.phone || "",
          qualification: data.provider.qualification || "",
          experience: data.provider.experience || "",
          description: data.provider.description || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:3001/api/admin/providers/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update provider");
      }

      navigate("/providers");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Provider</h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border rounded px-4 py-2"
            required
          />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full border rounded px-4 py-2"
          />

          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder="Qualification"
            className="w-full border rounded px-4 py-2"
          />

          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Experience"
            className="w-full border rounded px-4 py-2"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border rounded px-4 py-2 h-28"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded bg-blue-600 text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProvider;
