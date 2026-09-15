import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../utils/api";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  validateForm,
  allowLettersOnly,
  allowNumbersOnly,
  indianPhoneSchema,
} from "../../utils/adminValidators.js";

// ── Zod submit schema ─────────────────────────────────────────────────────────
const centreAdminUpdateSchema = z.object({
  fullName:     z.string().trim().min(2, "Centre name must be at least 2 characters").max(100, "Centre name too long"),
  phone:        indianPhoneSchema,
  qualification:z.string().trim().max(100, "Qualification too long").optional().or(z.literal("")),
  experience:   z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ invalid_type_error: "Experience must be a number" })
      .int("Experience must be a whole number")
      .min(0, "Experience cannot be negative")
      .max(60, "Experience cannot exceed 60 years")
      .optional()
  ),
  regularPrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ invalid_type_error: "Consultation fee must be a number" })
      .min(50, "Minimum consultation fee is ₹50")
      .max(99999, "Consultation fee cannot exceed ₹99,999")
      .optional()
  ),
  license:      z.string().trim().max(50, "License number too long").optional().or(z.literal("")),
});

// ── Error message component ───────────────────────────────────────────────────
const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 text-xs font-medium text-red-500">{message}</p>
  ) : null;

// ── Input class helper ────────────────────────────────────────────────────────
const inputCls = (hasError) =>
  `w-full rounded-xl border-2 bg-white p-3 text-[#2d4a36] focus:outline-none transition-colors ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-gray-200 focus:border-[#ffd333]"
  }`;

const CentreEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = searchParams.get("page") || "1";

  const [formData, setFormData] = useState({
    fullName:      "",
    email:         "",
    phone:         "",   // stored as 10 digits; +91 prepended on submit
    providerType:  "",
    qualification: "",
    experience:    "",
    license:       "",
    regularPrice:  "",
  });

  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [fieldErrors, setFieldErrors]       = useState({});

  // ── Fetch Centre ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCentre = async () => {
      try {
        setLoading(true);
        setError("");

        const res  = await api(`/api/provider/centre/${id}`);
        const data = res.centre;

        // Strip +91 prefix for display in the 10-digit phone field
        let initialPhone = data.phone || "";
        if (initialPhone.startsWith("+91")) {
          initialPhone = initialPhone.slice(3);
        }

        setFormData({
          fullName:      data.fullName      || "",
          email:         data.userRef?.email || data.email || "",
          phone:         initialPhone,
          providerType:  data.providerType  || "",
          qualification: data.qualification || "",
          experience:    data.experience    ?? "",
          license:       data.license       || "",
          regularPrice:  data.regularPrice  ?? "",
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

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;

    if (name === "fullName")     filtered = allowLettersOnly(value).slice(0, 100);
    if (name === "experience")   filtered = allowNumbersOnly(value).slice(0, 2);
    if (name === "regularPrice") filtered = allowNumbersOnly(value).slice(0, 5);
    if (name === "license")      filtered = value.slice(0, 50);
    if (name === "qualification") filtered = value.slice(0, 100);

    setFormData((prev) => ({ ...prev, [name]: filtered }));

    // Clear the field's error as the user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e) => {
    const digits = allowNumbersOnly(e.target.value).slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepend +91 before validation
    const finalPhone = formData.phone
      ? formData.phone.startsWith("+91")
        ? formData.phone
        : `+91${formData.phone}`
      : "";

    // Frontend Zod validation
    const { success, errors: zodErrors } = validateForm(centreAdminUpdateSchema, {
      fullName:      formData.fullName,
      phone:         finalPhone,
      qualification: formData.qualification,
      experience:    formData.experience,
      regularPrice:  formData.regularPrice,
      license:       formData.license,
    });

    if (!success) {
      setFieldErrors(zodErrors);
      const firstError = Object.values(zodErrors)[0];
      toast.error(firstError || "Please fix the highlighted fields.");
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);
      setError("");

      const dataToSubmit = {
        ...formData,
        phone: finalPhone,
      };

      const response = await api(`/api/provider/centre/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (response?.success === false) {
        throw new Error(response.message || "Update failed");
      }

      toast.success("Centre updated successfully");
      // Navigate only after successful API response (bug fix — was on onClick before)
      navigate(`/centre-list?page=${page}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-offwhite p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-[#2d4a36] mb-2 transition"
          >
            ← Back to Centres
          </button>
        </div>

        {/* API error banner */}
        {error && (
          <div className="mb-5 text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* LEFT — Profile Card */}
            <div className="bg-gradient-to-r from-darkgreen to-darkgreen/50 rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">
              <div className="flex flex-col items-center text-center">
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

                <h2 className="text-lg font-semibold text-yellow mt-3">
                  {formData.fullName || "Centre"}
                </h2>

                {formData.email && (
                  <p className="text-xs text-white mt-1 break-all">{formData.email}</p>
                )}

                <div className="mt-3 px-3 py-1 rounded-full bg-[#eef4ef] text-[#2d4a36] text-[11px] font-medium">
                  Centre Account
                </div>
              </div>
            </div>

            {/* RIGHT — Update Details */}
            <div className="md:col-span-2 bg-darkgreen/5 rounded-2xl shadow-sm border border-gray-100 p-6">

              <h2 className="text-lg font-semibold text-[#2d4a36] mb-6">Update Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Centre Name */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Centre Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter centre name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputCls(!!fieldErrors.fullName)}
                  />
                  <FieldError message={fieldErrors.fullName} />
                </div>

                {/* Email — read-only */}
                <div>
                  <label className="block text-label tracking-wide mb-2">Email</label>
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
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className={`flex items-center rounded-xl border-2 bg-white overflow-hidden ${fieldErrors.phone ? "border-red-400" : "border-gray-200 focus-within:border-[#ffd333]"}`}>
                    <span className="px-3 text-sm text-gray-500 border-r border-gray-200 select-none shrink-0">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      className="flex-1 p-3 text-[#2d4a36] focus:outline-none bg-transparent"
                    />
                  </div>
                  <FieldError message={fieldErrors.phone} />
                </div>

                {/* Provider Type */}
                {/* <div>
                  <label className="block text-label tracking-wide mb-2">
                    Provider Type
                  </label>

                  <select
                    name="providerType"
                    value={formData.providerType}
                    onChange={handleChange}
                    className={inputCls(false)}
                  >
                    <option value="centre">Centre</option>
                    <option value="individual">Individual</option>
                  </select>
                </div> */}

                {/* Qualification */}
                <div>
                  <label className="block text-label tracking-wide mb-2">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="Enter qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className={inputCls(!!fieldErrors.qualification)}
                  />
                  <FieldError message={fieldErrors.qualification} />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Experience <span className="text-gray-400 text-xs">(years, 0–60)</span>
                  </label>
                  <input
                    type="text"
                    name="experience"
                    inputMode="numeric"
                    placeholder="e.g. 5"
                    value={formData.experience}
                    onChange={handleChange}
                    className={inputCls(!!fieldErrors.experience)}
                  />
                  <FieldError message={fieldErrors.experience} />
                </div>

                {/* License */}
                <div>
                  <label className="block text-label tracking-wide mb-2">License</label>
                  <input
                    type="text"
                    name="license"
                    placeholder="Enter license number"
                    value={formData.license}
                    onChange={handleChange}
                    className={inputCls(!!fieldErrors.license)}
                  />
                  <FieldError message={fieldErrors.license} />
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Consultation Fee <span className="text-gray-400 text-xs">(min ₹50)</span>
                  </label>
                  <div className={`flex items-center rounded-xl border-2 bg-white overflow-hidden ${fieldErrors.regularPrice ? "border-red-400" : "border-gray-200 focus-within:border-[#ffd333]"}`}>
                    <span className="px-3 text-sm text-gray-500 border-r border-gray-200 select-none shrink-0">₹</span>
                    <input
                      type="text"
                      name="regularPrice"
                      inputMode="numeric"
                      placeholder="e.g. 500"
                      value={formData.regularPrice}
                      onChange={handleChange}
                      className="flex-1 p-3 text-[#2d4a36] focus:outline-none bg-transparent"
                    />
                  </div>
                  <FieldError message={fieldErrors.regularPrice} />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(`/centre-list?page=${page}`)}
                  className="px-6 py-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>

                {/* ✅ Bug fix: onClick removed — navigation now happens inside handleSubmit after success */}
                <button
                  type="submit"
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
