import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {api} from "../../utils/api.js"
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";


const ParentInactive = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const  navigate= useNavigate();
  const [parentpopup,setParentpopup]=useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);


  const getInactiveParents = async () => {
    try {
      setLoading(true);
      setError("");

      const data= await api(`/api/parent/inactive-parents`);


      const inactive = (data.parents || []).filter(
        (p) => !p.userRef?.isActive
      );

      setParents(inactive);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getInactiveParents();
  }, []);

  const handleDelete = async (userId) => {
  try {
    const data = await api(`/api/admin/parent/user/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!data.success) throw new Error(data.message);

    toast.success("Parent deleted");

    setParents((prev) =>
      prev.filter((p) => p.userRef?._id !== userId)
    );

    setParentpopup(false);
    setSelectedUserId(null);
  } catch (err) {
    console.log(err);
  }
};

  const handleActive = async (userId) => {
  try {
    const data = await api(`/api/parent/admin/parent/status`, {
      method: "PUT",
      body: JSON.stringify({
        userId,
        isActive: true,
      }),
    });

    if (!data.success) throw new Error(data.message);

   toast.success("Parent activated");


    setParents((prev) => prev.filter((p) => p.userRef?._id !== userId));
  } catch (err) {
    console.log(err);
  }
};


  return (
    <div className="p-6 min-h-screen bg-offwhite">
       <button
        type="button"
        onClick={() => navigate("/view-parent")}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Inactive Parents
      </h1>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : parents.length === 0 ? (
        <p className="text-gray-500">No inactive parents found</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Parent Name</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {parents.map((p) => (
                <tr
                  key={p._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.parentDetails?.fullName}
                  </td>
                   <td className="px-6 py-4 font-medium text-gray-900">
                    {p.parentDetails?.phoneNumber}
                  </td>

                  <td className="px-6 py-4">
                    <button onClick={()=>handleActive(p.userRef?._id)} 
                    className="bg-green-50 px-2 py-2 rounded-lg text-green-600">Activate</button>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => { 
                        setSelectedUserId(p.userRef?._id);
                         setParentpopup(true); }}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      )}
      {parentpopup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
      <h2 className="text-lg font-semibold text-gray-800">
        Delete Parent
      </h2>

      <p className="text-gray-600 mt-2">
        Are you sure you want to delete this parent?
      </p>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            setParentpopup(false);
            setSelectedUserId(null);
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={() => handleDelete(selectedUserId)}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ParentInactive;
