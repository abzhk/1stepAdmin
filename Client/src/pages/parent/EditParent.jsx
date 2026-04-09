import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {api} from "../../utils/api.js"
import toast from "react-hot-toast";

function EditParent() {
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


  useEffect(() => {
    const fetchParent = async () => {
      try {
        setLoading(true);
const data = await api(
  `/api/parent/getparent/${parentId}`
);

      setFormData({
  fullName: data.parentDetails?.fullName,
  childName: data.parentDetails?.childName , 
  phoneNumber: data.parentDetails?.phoneNumber,
  address: data.parentDetails?.address,
});

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

<div className="p-6 mt-2 max-w-xl mx-auto">
     <div className=" flex justify-end gap-3 mt-6 ">
        
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 rounded-xl"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-darkgreen text-white rounded-xl"
          >
            {loading ? "Saving..." : "Update"}
          </button>
        </div>
    <div className="p-6 mt-4 bg-white rounded-xl shadow">
      
      <h2 className="text-2xl font-bold text-[#2d4a36] mb-6">Edit Parent</h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">Full Name</label>
        <input
          className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
          placeholder="Full Name"
          value={formData.fullName}
          required
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
<label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">Child Name</label>
        <input
          className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
          placeholder="Child Name"
          value={formData.childName}
          onChange={(e) =>
            setFormData({ ...formData, childName: e.target.value })
          }
        />
<label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">Phone Number</label>
        <input
          className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
          placeholder="Phone Number"
          maxLength={10}
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />
<label className="mb-2 block text-sm font-bold tracking-wide text-[#2d4a36]">Address</label>
        <input
          className="w-full rounded-xl border-2 border-gray-400 bg-white p-3 text-[#2d4a36] shadow-sm transition-all duration-200 focus:border-[#ffd333] focus:outline-none focus:ring-0"
          placeholder="Address"
          multiple
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />

       
      </form>
    </div>
    </div>
  );
}

export default EditParent;
