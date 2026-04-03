import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";

function EditProvider() {
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
          phone: data.provider.phone || "",
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
      const onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length <= 10) {
        setFormData({ ...formData, phone: onlyNumbers });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
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
                className="rounded-xl bg-button px-6 py-2 text-white"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>

            <div className="rounded-2xl  bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  Full Name
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="Only alphabets are allowed"
                    className="w-full rounded-xl border border-gray-200 bg-offwhite px-4 py-2 focus:border-lightbutton focus:ring-lightbutton outline-none"
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full rounded-xl  border border-gray-200  bg-offwhite px-4 py-2 focus:border-lightbutton focus:ring-lightbutton outline-none"
                  />
                </label>
                <label>
                  Phone
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full rounded-xl border border-gray-200 bg-offwhite px-4 py-2 focus:border-lightbutton focus:ring-lightbutton outline-none"
                  />
                </label>
                <label>
                  Provider Type
                  <select
                    name="providerType"
                    value={formData.providerType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-offwhite px-4 py-2 bg-white focus:border-lightbutton focus:ring-lightbutton outline-none"
                  >
                    <option value="individual">Individual</option>
                    <option value="centre">Centre</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-2xl  bg-white p-6 shadow-sm mt-4">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Professional Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  Qualification
                  <input
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="Qualification"
                    className="w-full rounded-xl border border-gray-200 bg-offwhite px-4 py-2 focus:border-lightbutton focus:ring-lightbutton outline-none"
                  />
                </label>
                <label>
                  Experience
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Experience"
                    className="w-full rounded-xl border border-gray-200 bg-offwhite px-4 py-2 focus:border-lightbutton focus:ring-lightbutton outline-none"
                  />
                </label>
                <label>
                  License
                  <input
                    name="license"
                    value={formData.license}
                    onChange={handleChange}
                    placeholder="License Number"
                    className="w-full rounded-xl border border-gray-200  bg-offwhite px-4 py-2 focus:border-lightbutton focus:ring-lightbutton outline-none"
                  />
                </label>
                <label>
                  Consultation Fee
                  <input
                    name="regularPrice"
                    type="number"
                    value={formData.regularPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="Consultation Fee"
                    className="w-full rounded-xl border border-gray-200 bg-offwhite px-4 py-2 focus:border-lightbutton focus:ring-lightbutton outline-none"
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
                <label>
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provider Description"
                    className=" w-full h-28 rounded-xl border border-gray-200 bg-offwhite px-4 py-2 focus:border-lightbutton focus:ring-lightbutton outline-none"
                  />
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProvider;
