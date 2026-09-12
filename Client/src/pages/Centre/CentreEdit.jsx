import React, { useEffect, useState} from "react";
import { useParams, useNavigate ,useSearchParams} from "react-router-dom";
import { api } from "../../utils/api";
import toast from "react-hot-toast";

const CentreEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

const page = searchParams.get("page") || "1";

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

  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCentre = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api(`/api/provider/centre/${id}`);
        const data = res.centre;

        let initialPhone = data.phone || "";

        if (initialPhone.startsWith("+91")) {
          initialPhone = initialPhone.slice(3);
        }

        setFormData({
          fullName: data.fullName || "",
          email: data.userRef?.email || data.email || "",
          phone: initialPhone,
          providerType: data.providerType || "",
          qualification: data.qualification || "",
          experience: data.experience || "",
          license: data.license || "",
          regularPrice: data.regularPrice || "",
        });

        setProfilePicture(data.profilePicture || "");

      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load centre details");
      } finally {
        setLoading(false);
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

  const handlePhoneChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      phone: e.target.value.replace(/\D/g, ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      let finalPhone = formData.phone;

      if (finalPhone && !finalPhone.startsWith("+91")) {
        finalPhone = `+91${finalPhone}`;
      }

      const dataToSubmit = {
        ...formData,
        phone: finalPhone,
      };

      const response = await api(`/api/provider/centre/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response?.success === false) {
        throw new Error(response.message || "Update failed");
      }

      toast.success("Centre updated successfully");

      navigate("/centre-list");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-[#2d4a36] mb-2"
          >
            ← Back to Centres
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* LEFT - PROFILE */}
            <div className="bg-gradient-to-r from-darkgreen to-darkgreen/50 rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">

              <div className="flex flex-col items-center text-center">

                {/* Profile Image */}
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={formData.fullName || "Centre"}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#f1f5f2]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-yellow flex items-center justify-center text-3xl font-semibold text-[#2d4a36]">
                    {formData.fullName?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                )}

                {/* Name */}
                <h2 className="text-lg font-semibold text-yellow mt-3">
                  {formData.fullName || "Centre"}
                </h2>

                {/* Email */}
                {formData.email && (
                  <p className="text-xs text-white mt-1 break-all">
                    {formData.email}
                  </p>
                )}

                {/* Account Type */}
                <div className="mt-3 px-3 py-1 rounded-full bg-[#eef4ef] text-[#2d4a36] text-[11px] font-medium">
                  Centre Account
                </div>

              </div>
            </div>

            {/* RIGHT - UPDATE DETAILS */}
            <div className="md:col-span-2 bg-darkgreen/5 rounded-2xl shadow-sm border border-gray-100 p-6">

              <h2 className="text-lg font-semibold text-[#2d4a36] mb-6">
                Update Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Centre Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter centre name"
                    value={formData.fullName}
                    required
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-3 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                  />
                </div>

                {/* Provider Type */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Provider Type
                  </label>

                  <select
                    name="providerType"
                    value={formData.providerType}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                  >
                    <option value="centre">Centre</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Qualification
                  </label>

                  <input
                    type="text"
                    name="qualification"
                    placeholder="Enter qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Experience
                  </label>

                  <input
                    type="text"
                    name="experience"
                    placeholder="Enter experience"
                     min="0"
                     max="90"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                  />
                </div>

                {/* License */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    License
                  </label>

                  <input
                    type="text"
                    name="license"
                    placeholder="Enter license number"
                    value={formData.license}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                  />
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Consultation Fee
                  </label>

                  <input
                    type="number"
                    name="regularPrice"
                    placeholder="Enter consultation fee"
                    value={formData.regularPrice}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                  />
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">

                <button
                  type="button"
                  onClick={() => navigate(`/centre-list?page=${page}`)}
                  className="px-6 py-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  onClick={() => navigate(`/centre-list?page=${page}`)}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-darkgreen text-white hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default CentreEdit;
