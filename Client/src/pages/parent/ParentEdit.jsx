import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {api} from "../../utils/api.js"
import toast from "react-hot-toast";

function ParentEdit() {
  const { parentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    childName: "",
    phoneNumber: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
const [email, setEmail] = useState("");


useEffect(() => {
  const fetchParent = async () => {
    try {
      setLoading(true);

      const data = await api(
        `/api/parent/getparent/${parentId}`
      );

      setFormData({
        fullName: data.parentDetails?.fullName || "",
        childName: data.parentDetails?.childName || "",
        phoneNumber: data.parentDetails?.phoneNumber || "",
        address: data.parentDetails?.address || "",
      });

      setProfilePicture(data.userRef?.profilePicture || "");
      setEmail(data.userRef?.email || "");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchParent();
}, [parentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await api(
        `/api/admin/parent/user/${parentId}`,
        {
          method: "PUT",
          
          body: JSON.stringify({
            "parentDetails.fullName": formData.fullName,
            "parentDetails.childName": formData.childName,
            "parentDetails.phoneNumber": formData.phoneNumber,
            "parentDetails.address": formData.address,
          }),
        }
      );
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
          ← Back to Parents
        </button>
{/* 
        <h1 className="text-2xl font-semibold text-[#2d4a36]">
          Edit Parent
        </h1> */}

       
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
<div className="bg-greenmuted/40 rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">

  <div className="flex flex-col items-center text-center">

    {/* Profile Image */}
    {profilePicture ? (
      <img
        src={profilePicture}
        alt="Parent"
        className="w-24 h-24 rounded-full object-cover border-4 border-[#f1f5f2]"
      />
    ) : (
      <div className="w-24 h-24 rounded-full bg-[#e8eee9] flex items-center justify-center text-3xl font-semibold text-[#2d4a36]">
        {formData.fullName?.charAt(0)?.toUpperCase() || "P"}
      </div>
    )}

    {/* Name */}
    <h2 className="text-lg font-semibold text-[#2d4a36] mt-3">
      {formData.fullName || "Parent"}
    </h2>

    {/* Email */}
    {email && (
      <p className="text-xs text-gray-500 mt-1 break-all">
        {email}
      </p>
    )}

    {/* Account type */}
    <div className="mt-3 px-3 py-1 rounded-full bg-[#eef4ef] text-[#2d4a36] text-[11px] font-medium">
      Parent Account
    </div>

  </div>
</div>

          {/* RIGHT - UPDATE DETAILS */}
          <div className="md:col-span-2 bg-offwhite/100 rounded-2xl shadow-sm border border-gray-100 p-6">

            <h2 className="text-lg font-semibold text-[#2d4a36] mb-6">
              Update Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Full Name */}
              <div>
                <label className="block text-label tracking-wide mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  required
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                />
              </div>

              {/* Child Name */}
              <div>
                <label className="block text-label tracking-wide mb-2">
                  Child Name
                </label>

                <input
                  type="text"
                  placeholder="Enter child name"
                  value={formData.childName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      childName: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] focus:border-[#ffd333] focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-label tracking-wide mb-2">
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                        phoneNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
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
                  value={email}
                  disabled
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-3 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-label tracking-wide mb-2">
                  Address
                </label>

                <textarea
                  rows={4}
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-[#2d4a36] resize-none focus:border-[#ffd333] focus:outline-none"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">

              <button
                type="button"
                onClick={() => navigate(-1)}
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
