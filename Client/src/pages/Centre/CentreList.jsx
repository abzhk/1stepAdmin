import React,{ useEffect, useState }  from "react";
import { AiFillEye } from "react-icons/ai";
import { FiEdit2, FiGrid, FiList } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "../../utils/api";


const CentreList = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedCentre, setSelectedCentre] = useState(null);


  const [centres, setCentres] = useState([]);

  const handleDeleteClick = (centre) => {
  if (centre.totalProviders > 0) {
    alert("Cannot delete centre with linked providers");
    return;
  }

  setSelectedCentre(centre);
  setShowDeleteModal(true);
};

  useEffect(() => {
  const fetchCentres = async () => {
    try {
      const data = await api("/api/provider/centre-list");

      setCentres(data.centres || []);

      console.log("CENTRES:", data.centres);
    } catch (err) {
      console.error(err);
    }
  };

  fetchCentres();
}, []);

const confirmDelete = async () => {
  try {
    await api(`/api/provider/centre/${selectedCentre._id}`, "DELETE");

    setCentres((prev) =>
      prev.filter((c) => c._id !== selectedCentre._id)
    );

    setShowDeleteModal(false);
    setSelectedCentre(null);

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};

 const toggleCentreStatus = async (centre) => {
    if (centre.totalProviders > 0 && centre.isActive) {
      alert("Remove providers before deactivating centre");
      return;
    }

    try {
      const res = await api("/api/provider/centre/set-active-status", {
        method: "PUT",
        body: JSON.stringify({
          centreId: centre._id,
          isActive: !centre.isActive,
        }),
      });

      if (res.success) {
        setCentres((prev) =>
          prev.map((c) =>
            c._id === centre._id
              ? { ...c, isActive: !centre.isActive }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };


  return (
    <div className="p-4 md:p-8 bg-[#f8f6f2] min-h-screen">
 <button
        type="button"
        onClick={() => navigate( "/centre" )}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>

      <div className="flex items-center justify-between mb-6">


        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg border ${
              viewMode === "grid"
                ? "bg-green-900 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            <FiGrid size={18} />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg border ${
              viewMode === "list"
                ? "bg-green-900 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            <FiList size={18} />
          </button>
        </div>

        <button
  onClick={() => navigate("/inactive-centre")}
  className="px-4 py-2 rounded-xl font-semibold text-white bg-green-900"
>
  Inactive Centres
</button>
      </div>


      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-14">

          {centres.map((centre) => (
            <div
              key={centre._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>


                <div className="h-52 overflow-hidden rounded-xl mb-2">
                  <img
                    src={centre.profilePicture}
                    alt={centre.fullname}
                    className="w-full h-full object-cover"
                  />
                </div>


                <div className="p-2">

                  <div className="flex justify-between items-start">
                    <h2 className="font-semibold text-gray-900 text-lg">
                      {centre.fullName}
                    </h2>

                    {/* <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        centre.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {centre.isActive ? "Active" : "Inactive"}
                    </span> */}

                    <button
  onClick={() => toggleCentreStatus(centre)}
  disabled={centre.totalProviders > 0 && centre.isActive}
  className={`px-3 py-2 rounded-xl text-sm ${
    centre.totalProviders > 0 && centre.isActive
      ? "bg-gray-300 cursor-not-allowed"
      : centre.isActive
      ? "bg-red-100 text-red-600"
      : "bg-green-100 text-green-600"
  }`}
>
  {centre.isActive ? "Deactivate" : "Activate"}
</button>
                  </div>

                  <div className="space-y-2 mt-4 text-sm">
                    <p>
                      <b>Email:</b> {centre.user?.email || "-"}
                    </p>
                    <p>
                      <b>Phone:</b> {centre.phone}
                    </p>
                  </div>

                  <div className="flex justify-between mt-4 text-sm">
                    <div>
                      <p className="text-gray-400">Providers</p>
                      <p className="font-bold text-green-900">
                        {centre.totalProviders}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">Sessions</p>
                      <p className="font-bold text-green-900">
                        {centre.totalSessions}
                      </p>
                    </div>
                  </div>


                  <div className="flex gap-2 mt-4 ">
                    <button
                      onClick={() =>
                        navigate(`/centre-detail/${centre._id}`)
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-peach text-white text-sm w-60"
                    >
                      <AiFillEye />
                      View
                    </button>

                    <button
                      onClick={() =>
    navigate(`/edit-centre/${centre._id}`)
  }
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                    >
                      <FiEdit2 />
                    </button>

                    {/* <button
 onClick={() => handleDeleteClick(centre)}
  className={`w-10 h-10 flex items-center justify-center rounded-xl ${
    centre.totalProviders > 0
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-red-500 text-white hover:bg-red-600"
  }`}
>
 <MdDelete size={18} />
</button> */}
                  </div>
{showDeleteModal && (
  <div className="fixed inset-0 bg-white/10 bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Delete Centre
      </h2>

      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to delete <b>{selectedCentre?.fullName}</b>?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700"
        >
          Cancel
        </button>

        <button
          onClick={confirmDelete}
          className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Centre</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Providers</th>
                <th className="p-3 text-left">Sessions</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {centres.map((centre) => (
                <tr
                  key={centre._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={centre.profilePicture}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    {centre.fullName}
                  </td>

                  <td className="p-3">{centre.email}</td>
                  <td className="p-3">{centre.phone}</td>
                  <td className="p-3">{centre.totalProviders}</td>
                  <td className="p-3">{centre.totalSessions}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        centre.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {centre.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 flex justify-end gap-2">
                    <button className="p-2 bg-gray-100 rounded-lg">
                      <AiFillEye />
                    </button>

                    <button  onClick={() =>
    navigate(`/edit-centre/${centre._id}`)
  } className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FiEdit2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default CentreList;