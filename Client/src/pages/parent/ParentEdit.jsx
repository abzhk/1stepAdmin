import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  validateForm,
  allowLettersOnly,
  allowNumbersOnly,
  indianPhoneSchema,
} from "../../utils/adminValidators.js";

// ── Zod submit schema ─────────────────────────────────────────────────────────
const parentAdminUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name too long")
    .regex(/^[A-Za-z\s]+$/, "Full name can only contain letters and spaces"),
  childName: z
    .string()
    .trim()
    .max(100, "Child name too long")
    .optional()
    .or(z.literal("")),
  phoneNumber: indianPhoneSchema,
  address: z
    .string()
    .trim()
    .max(500, "Address too long")
    .optional()
    .or(z.literal("")),
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

function ParentEdit() {
  const { parentId }              = useParams();
  const navigate                  = useNavigate();
  const [searchParams]            = useSearchParams();
  const page                      = searchParams.get("page") || "1";

  const [formData, setFormData]   = useState({
    fullName:    "",
    childName:   "",
    phoneNumber: "",   // stored as 10 digits; +91 prepended on submit
    address:     "",
  });

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [profilePicture, setProfilePicture] = useState("");
  const [email, setEmail]             = useState("");

  // ── Fetch Parent ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchParent = async () => {
      try {
        setLoading(true);

        const data = await api(`/api/parent/getparent/${parentId}`);

        // Strip +91 prefix for display in the 10-digit phone field
        const rawPhone = String(data.parentDetails?.phoneNumber || "");
        const displayPhone = rawPhone.startsWith("+91")
          ? rawPhone.slice(3)
          : allowNumbersOnly(rawPhone).slice(0, 10);

        setFormData({
          fullName:    data.parentDetails?.fullName   || "",
          childName:   data.parentDetails?.childName  || "",
          phoneNumber: displayPhone,
          address:     data.parentDetails?.address    || "",
        });

        setProfilePicture(data.parentDetails?.profilePicture || "");
        setEmail(data.userRef?.email || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParent();
  }, [parentId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneChange = (e) => {
    const digits = allowNumbersOnly(e.target.value).slice(0, 10);
    setFormData((prev) => ({ ...prev, phoneNumber: digits }));
    if (fieldErrors.phoneNumber) {
      setFieldErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepend +91 before validation
    const finalPhone = formData.phoneNumber
      ? formData.phoneNumber.startsWith("+91")
        ? formData.phoneNumber
        : `+91${formData.phoneNumber}`
      : "";

    // Frontend Zod validation
    const { success, errors: zodErrors } = validateForm(parentAdminUpdateSchema, {
      fullName:    formData.fullName,
      childName:   formData.childName,
      phoneNumber: finalPhone,
      address:     formData.address,
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

      const data = await api(`/api/admin/parent/user/${parentId}`, {
        method: "PUT",
        body: JSON.stringify({
          "parentDetails.fullName":    formData.fullName,
          "parentDetails.childName":   formData.childName,
          "parentDetails.phoneNumber": finalPhone,
          "parentDetails.address":     formData.address,
        }),
      });

      if (!data.success) {
        throw new Error(data.message || "Update failed");
      }

      toast.success("Parent updated successfully");
      navigate(-1);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-offwhite p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/view-parent?page=${page}`)}
            className="text-sm text-gray-500 hover:text-[#2d4a36] mb-2 transition"
          >
            ← Back to Parents
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
                    alt="Parent"
                    loading="lazy"
                    decoding="async"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#f1f5f2]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-yellow flex items-center justify-center text-3xl font-semibold text-[#2d4a36]">
                    {formData.fullName?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                )}

                <h2 className="text-lg font-semibold text-yellow mt-3">
                  {formData.fullName || "Parent"}
                </h2>

                {email && (
                  <p className="text-xs text-white mt-1 break-all">{email}</p>
                )}

                <div className="mt-3 px-3 py-1 rounded-full bg-[#eef4ef] text-[#2d4a36] text-[11px] font-medium">
                  Parent Account
                </div>
              </div>
            </div>

            {/* RIGHT — Update Details */}
            <div className="md:col-span-2 bg-darkgreen/5 rounded-2xl shadow-sm border border-gray-100 p-6">

              <h2 className="text-lg font-semibold text-[#2d4a36] mb-6">Update Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleChange("fullName", allowLettersOnly(e.target.value).slice(0, 100))
                    }
                    className={inputCls(!!fieldErrors.fullName)}
                  />
                  <FieldError message={fieldErrors.fullName} />
                </div>

                {/* Child Name */}
                <div>
                  <label className="block text-label tracking-wide mb-2">Child Name</label>
                  <input
                    type="text"
                    placeholder="Enter child name"
                    value={formData.childName}
                    onChange={(e) =>
                      handleChange("childName", e.target.value.slice(0, 100))
                    }
                    className={inputCls(!!fieldErrors.childName)}
                  />
                  <FieldError message={fieldErrors.childName} />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-label tracking-wide mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div
                    className={`flex items-center rounded-xl border-2 bg-white overflow-hidden ${
                      fieldErrors.phoneNumber
                        ? "border-red-400"
                        : "border-gray-200 focus-within:border-[#ffd333]"
                    }`}
                  >
                    <span className="px-3 text-sm text-gray-500 border-r border-gray-200 select-none shrink-0">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      className="flex-1 p-3 text-[#2d4a36] focus:outline-none bg-transparent"
                    />
                  </div>
                  <FieldError message={fieldErrors.phoneNumber} />
                </div>

                {/* Email — read-only */}
                <div>
                  <label className="block text-label tracking-wide mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-3 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-label tracking-wide mb-2">
                    Address{" "}
                    <span className="text-gray-400 text-xs">
                      ({formData.address.length}/500)
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) =>
                      handleChange("address", e.target.value.slice(0, 500))
                    }
                    className={`${inputCls(!!fieldErrors.address)} resize-none`}
                  />
                  <FieldError message={fieldErrors.address} />
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(`/parent-list?page=${page}`)}
                  className="px-6 py-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>

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
}

export default ParentEdit;
