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
    <div className="p-6 mt-6 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Edit Parent</h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
<label className="block text-sm font-medium text-gray-700">Child Name</label>
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Child Name"
          value={formData.childName}
          onChange={(e) =>
            setFormData({ ...formData, childName: e.target.value })
          }
        />
<label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />
<label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-button text-white rounded-xl"
          >
            {loading ? "Saving..." : "Update"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 rounded-xl"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditParent;
