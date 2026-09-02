import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const CentreEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    providerType: "",
    qualification: "",
    experience: "",
    license: "",
    regularPrice: "",
  });

  useEffect(() => {
    const fetchCentre = async () => {
      try {
        const res = await api(`/api/provider/centre/${id}`);
        const data = res.centre;

        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          providerType: data.providerType || "",
          qualification: data.qualification || "",
          experience: data.experience || "",
          license: data.license || "",
          regularPrice: data.regularPrice || "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchCentre();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
     await api(`/api/provider/centre/${id}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formData),
});

      navigate("/centre-list");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite p-6">
      {/* Top Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={() => navigate("/centre-list")}
          className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 rounded-lg bg-peach text-white"
        >
          Update
        </button>
      </div>

      {/* BASIC INFO */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Full Name
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 focus:bg-white focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 focus:bg-white focus:border-green-500 outline-none"
            />
          </div>

         <div>
  <label className="text-sm text-gray-700 mb-1 block">
    Phone
  </label>

  <input
    name="phone"
    type="tel"
    inputMode="numeric"
    maxLength={10}
    value={formData.phone}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        phone: e.target.value.replace(/\D/g, ""),
      }))
    }
    className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 focus:bg-white focus:border-green-500 outline-none"
  />
</div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Provider Type
            </label>
            <select
              name="providerType"
              value={formData.providerType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 focus:bg-white focus:border-green-500 outline-none"
            >
              <option value="individual">Individual</option>
              <option value="centre">Centre</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL DETAILS */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Professional Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Qualification
            </label>
            <input
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 focus:bg-white focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Experience
            </label>
            <input
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 focus:bg-white focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">License</label>
            <input
              name="license"
              value={formData.license}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 focus:bg-white focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Consultation Fee
            </label>
            <input
              name="regularPrice"
              value={formData.regularPrice}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-100 focus:bg-white focus:border-green-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentreEdit;
