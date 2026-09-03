import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";

function ProviderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    qualification: "",
    experience: "",
    license: "",
    providerType: "individual",
    regularPrice: "",
    description: "",
    therapytype: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [therapyOptions, setTherapyOptions] = useState([]);


  useEffect(() => {
  const fetchTherapies = async () => {
    const data = await api("/api/services/serviceMode")   ;
    setTherapyOptions(data.data);   
    console.log("therapy options:", data);
  };

  fetchTherapies();
}, []);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api(`/api/provider/providersbyid/${id}`);

        setFormData({
          fullName: data.provider.fullName || "",
          email: data.provider.email || "",
          phone: String(data.provider.phone || "")
  .replace(/\D/g, "")
  .slice(0, 10),
          qualification: data.provider.qualification || "",
          experience: data.provider.experience || "",
          license: data.provider.license || "",
          providerType: data.provider.providerType || "individual",
          regularPrice: data.provider.regularPrice || "",
          description: data.provider.description || "",
          therapytype: data.provider.therapytype || [],
        });
        console.log(data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "phone") {
    setFormData((prev) => ({
      ...prev,
      phone: value.replace(/\D/g, "").slice(0, 10),
    }));
    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await api(`/api/admin/providers/${id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      if (!data.success) {
        throw new Error(data.message || "Update failed");
      }
      toast.success("Provider updated successfully");

      navigate("/allproviders");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite p-8">
      <div className="max-w-6xl mx-auto">
        {/* <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Provider
          </h1>
        </div> */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className=" rounded-2xl p-4">
            <div className="flex justify-end gap-3 mb-2">
              <button
                type="button"
                onClick={() => navigate("/allproviders")}
                className="rounded-xl bg-white px-5 py-2 text-darkgreen"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-darkgreen px-6 py-2 text-white"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>

            <div className="rounded-2xl  bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#2d4a36]">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  Full Name
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="Only alphabets are allowed"
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  Email
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  Phone
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  Provider Type
                  <select
                    name="providerType"
                    value={formData.providerType}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  >
                    <option value="individual">Individual</option>
                    <option value="centre">Centre</option>
                  </select>
                </label>
              </div>
            

            <div className="rounded-2xl mt-20">
              <h2 className="mb-4 text-2xl font-bold text-[#2d4a36]">
                Professional Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  Qualification
                  <input
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="Qualification"
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  Experience
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Experience"
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  License
                  <input
                    name="license"
                    value={formData.license}
                    onChange={handleChange}
                    placeholder="License Number"
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  Consultation Fee
                  <input
                    name="regularPrice"
                    type="number"
                    value={formData.regularPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="Consultation Fee"
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1  gap-4 mt-4">
               <div className="border border-gray-200 rounded-xl p-2 bg-offwhite">
  
  <div className="flex flex-wrap gap-2 mb-2">
    {formData.therapytype.map((val) => {
      const item = therapyOptions.find((t) => t.value === val);

      return (
        <span
          key={val}
          className="flex items-center gap-1 bg-greenmuted text-white px-3 py-1 rounded-full text-sm"
        >
         {item ? item.label : val}

          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                therapytype: formData.therapytype.filter(
                  (v) => v !== val
                ),
              });
            }}
            className="ml-1 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </span>
      );
    })}
  </div>

  {/* Dropdown */}
  <select
  onChange={(e) => {
    const value = e.target.value;

  
    const selectedItem = therapyOptions.find(
      (t) => t.value === value
    );

    const label = selectedItem?.label;

    if (label && !formData.therapytype.includes(label)) {
      setFormData({
        ...formData,
        therapytype: [...formData.therapytype, label],
      });
    }

    
    e.target.value = "";
  }}
  className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200"
>
  <option value="">Select Therapy</option>

  {therapyOptions.map((item) => (
    <option key={item.value} value={item.value}>
      {item.label}
    </option>
  ))}
</select>
</div>
                <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provider Description"
                    className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                  />
                </label>
              </div>
            </div>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProviderEdit;
