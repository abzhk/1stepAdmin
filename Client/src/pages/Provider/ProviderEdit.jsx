import React, { useEffect, useState } from "react";
import { useParams, useNavigate,  useSearchParams, } from "react-router-dom";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";

function ProviderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
   const [searchParams] = useSearchParams();

  const page = searchParams.get("page") || "1";

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
  const [profilePicture, setProfilePicture] = useState("");

  // =========================================================
  // FETCH THERAPY OPTIONS
  // =========================================================
  useEffect(() => {
    const fetchTherapies = async () => {
      try {
        const data = await api("/api/services/serviceMode");

        setTherapyOptions(data.data);

        console.log("therapy options:", data);
      } catch (err) {
        console.error("Failed to fetch therapy options:", err);
      }
    };

    fetchTherapies();
  }, []);

  // =========================================================
  // FETCH PROVIDER
  // =========================================================
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api(`/api/provider/providersbyid/${id}`);

        console.log("Provider data:", data);

        setFormData({
          fullName: data.provider?.fullName || "",
          email: data.provider?.email || "",
          phone: String(data.provider?.phone || "")
            .replace(/\D/g, "")
            .slice(0, 10),
          qualification: data.provider?.qualification || "",
          experience: data.provider?.experience || "",
          license: data.provider?.license || "",
          providerType: data.provider?.providerType || "individual",
          regularPrice: data.provider?.regularPrice || "",
          description: data.provider?.description || "",
          therapytype: data.provider?.therapytype || [],
        });

        // Provider profile picture
        setProfilePicture(data.provider?.profilePicture || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================
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

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================
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


  // UI
 
  return (
    <div className="min-h-screen bg-offwhite p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* 
            BACK BUTTON*/}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/allproviders?page=${page}`)}
            className="text-sm text-gray-500 hover:text-[#2d4a36] transition"
          >
            ← Back to Providers
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/*  MAIN 2 COLUMN LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/*LEFT - PROVIDER PROFILE CARD*/}
            <div className="md:col-span-1">

              <div className="md:sticky md:top-24">

                <div className="bg-gradient-to-r from-darkgreen to-darkgreen/50 rounded-2xl shadow-sm border border-gray-100 p-5">

                  <div className="flex flex-col items-center text-center">

                    {/* 
                        PROFILE IMAGE*/}
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Provider"
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#f1f5f2]"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-yellow flex items-center justify-center text-3xl font-semibold text-[#2d4a36]">
                        {formData.fullName?.charAt(0)?.toUpperCase() || "P"}
                      </div>
                    )}

                    {/* 
                        PROVIDER NAME*/}
                    <h2 className="text-lg font-semibold text-yellow mt-3">
                      {formData.fullName || "Provider"}
                    </h2>

                    {/* =========================================
                        EMAIL
                    ========================================== */}
                    {formData.email && (
                      <p className="text-xs text-white mt-1 break-all">
                        {formData.email}
                      </p>
                    )}

                    {/* =========================================
                        PHONE
                    ========================================== */}
                    {formData.phone && (
                      <p className="text-xs text-white/80 mt-1">
                        {formData.phone}
                      </p>
                    )}

                    {/* =========================================
                        PROVIDER TYPE
                    ========================================== */}
                    <div className="mt-3 px-3 py-1 rounded-full bg-[#eef4ef] text-[#2d4a36] text-[11px] font-medium">
                      {formData.providerType === "centre"
                        ? "Centre Provider"
                        : "Individual Provider"}
                    </div>

                  

                  </div>
                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}
            <div className="md:col-span-2 space-y-5">

              {/* =================================================
                  SECTION 1 - BASIC INFORMATION
              ================================================== */}
              <div className="rounded-2xl bg-greenmuted/10 p-6 shadow-sm">

                <h2 className="mb-6 text-2xl font-bold text-[#2d4a36]">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* =========================================
                      FULL NAME
                  ========================================== */}
                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    Full Name

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Full Name"
                      required
                      pattern="^[A-Za-z\s]+$"
                      title="Only alphabets are allowed"
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    />

                  </label>

                  {/* =========================================
                      EMAIL
                  ========================================== */}
                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    Email

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    />

                  </label>

                  {/* =========================================
                      PHONE
                  ========================================== */}
                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    Phone

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      maxLength={10}
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    />

                  </label>

                  {/* =========================================
                      PROVIDER TYPE
                  ========================================== */}
                  {/* <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    Provider Type

                    <select
                      name="providerType"
                      value={formData.providerType}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    >
                      <option value="individual">
                        Individual
                      </option>

                      <option value="centre">
                        Centre
                      </option>
                    </select>

                  </label> */}

                </div>

              </div>


              {/* =================================================
                  SECTION 2 - PROFESSIONAL DETAILS
              ================================================== */}
              <div className="rounded-2xl bg-greenmuted/10 p-6 shadow-sm">

                <h2 className="mb-6 text-2xl font-bold text-[#2d4a36]">
                  Professional Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* =========================================
                      QUALIFICATION
                  ========================================== */}
                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    Qualification

                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="Qualification"
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    />

                  </label>

                  {/* =========================================
                      EXPERIENCE
                  ========================================== */}
                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    Experience

                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Experience"
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    />

                  </label>

                  {/* =========================================
                      LICENSE
                  ========================================== */}
                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    License

                    <input
                      type="text"
                      name="license"
                      value={formData.license}
                      onChange={handleChange}
                      placeholder="License Number"
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    />

                  </label>

                  {/* =========================================
                      CONSULTATION FEE
                  ========================================== */}
                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    Consultation Fee

                    <input
                      type="number"
                      name="regularPrice"
                      value={formData.regularPrice}
                      onChange={handleChange}
                      min="0"
                      placeholder="Consultation Fee"
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    />

                  </label>

                </div>


                {/* =============================================
                    THERAPY TYPE
                ============================================== */}
                <div className="mt-5">

                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36] mb-2">
                    Therapy Type
                  </label>

                  <div className="border border-gray-200 rounded-xl p-3 bg-offwhite">

                    {/* =========================================
                        SELECTED THERAPIES
                    ========================================== */}
                    <div className="flex flex-wrap gap-2 mb-3">

                      {formData.therapytype.map((val) => {

                        const item = therapyOptions.find(
                          (t) => t.value === val
                        );

                        return (
                          <span
                            key={val}
                            className="flex items-center gap-1 bg-greenmuted text-white px-3 py-1 rounded-full text-sm"
                          >

                            {item ? item.label : val}

                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  therapytype:
                                    prev.therapytype.filter(
                                      (v) => v !== val
                                    ),
                                }));
                              }}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>

                          </span>
                        );

                      })}

                    </div>


                    {/* =========================================
                        THERAPY DROPDOWN
                    ========================================== */}
                    <select
                      defaultValue=""
                      onChange={(e) => {

                        const value = e.target.value;

                        if (!value) {
                          return;
                        }

                        const selectedItem =
                          therapyOptions.find(
                            (t) => t.value === value
                          );

                        const label = selectedItem?.label;

                        if (
                          label &&
                          !formData.therapytype.includes(label)
                        ) {
                          setFormData((prev) => ({
                            ...prev,
                            therapytype: [
                              ...prev.therapytype,
                              label,
                            ],
                          }));
                        }

                        e.target.value = "";

                      }}
                      className="w-full bg-white rounded-lg px-3 py-2 border border-gray-200"
                    >

                      <option value="">
                        Select Therapy
                      </option>

                      {therapyOptions.map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>


                {/* =============================================
                    DESCRIPTION
                ============================================== */}
                <div className="mt-5">

                  <label className="block text-sm font-bold tracking-wide text-[#2d4a36]">

                    Description

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provider Description"
                      rows={5}
                      className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] resize-none shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
                    />

                  </label>

                </div>

              </div>


              {/* =================================================
                  ACTION BUTTONS
              ================================================== */}
              <div className="rounded-2xl bg-greenmuted/10 p-5 shadow-sm">

                <div className="flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={() => navigate(`/allproviders?page=${page}`)}
                    className="rounded-xl bg-gray-100 px-6 py-2.5 text-gray-700 hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-darkgreen px-6 py-2.5 text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>

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