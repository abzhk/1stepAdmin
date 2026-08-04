import React, { useEffect, useState } from "react";
import { AiFillEye } from "react-icons/ai";
import { FiEdit2, FiGrid, FiList } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "../../utils/api";
import toast from "react-hot-toast";
import SortableHeader from "../../Components/SortableHeader";

const CentreList = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid");
  const [centres, setCentres] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({
  key: "createdAt",
  direction: "desc",
});

  const limit = 12;

  const fetchCentres = async () => {
    try {
      const startIndex = (page - 1) * limit;

     const params = new URLSearchParams({
  startIndex,
  limit,
  sort: sortConfig.key,
  order: sortConfig.direction,
});

const data = await api(
  `/api/provider/centre-list?${params}`
);

      setCentres(data.centres || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, [page, sortConfig]);

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
        toast.success(
          `Centre ${!centre.isActive ? "activated" : "deactivated"}`,
        );

        if (centre.isActive) {
          setCentres((prev) => prev.filter((c) => c._id !== centre._id));
        } else {
          setCentres((prev) =>
            prev.map((c) =>
              c._id === centre._id ? { ...c, isActive: true } : c,
            ),
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };


  const handleSort = (key) => {
  const direction =
    sortConfig.key === key && sortConfig.direction === "asc"
      ? "desc"
      : "asc";

  setPage(1);

  setSortConfig({
    key,
    direction,
  });
};

  return (
    <div className="p-4 md:p-8 bg-offwhite min-h-screen">
      {/* BACK */}
      <button
        onClick={() => navigate("/centre")}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 bg-white px-2 py-2 rounded-xl shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg border ${
              viewMode === "grid"
                ? "bg-green-900 text-white hover:bg-yellow"
                : "bg-white text-gray-600 "
            }`}
          >
            <FiGrid size={18} />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg border ${
              viewMode === "list"
                ? "bg-green-900 text-white hover:bg-yellow"
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

      {/* GRID VIEW */}
      {viewMode === "grid" ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {centres.map((centre) => (
              <div
                key={centre._id}
                className="group bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* IMAGE */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={centre.profilePicture}
                    alt={centre.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  <div className="absolute inset-0 " />

                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    {/* <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      centre.isActive
                        ? "bg-green-500/20 text-green-100"
                        : "bg-red-500/20 text-red-100"
                    }`}
                  >
                    {centre.isActive ? "Active" : "Inactive"}
                  </span> */}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="text-sm text-gray-600 space-y-1">
                    <h2 className="text-darkgreen font-semibold text-lg truncate">
                      {centre.fullName}
                    </h2>
                    <p className="truncate">
                      <span className="text-cardfooter uppercase">Email:</span>{" "}
                      <span className="text-cardfooter">
                            {centre.userRef?.email || centre.email || "-"}
                      </span>
                    </p>
                    {/* <p>
                    <span className="text-gray-400">Phone:</span>{" "}
                    {centre.phone}
                  </p> */}
                  </div>

                  {/* STATS */}
                  <div className="flex justify-between">
                    <div>
                      <p className="text-cardfooter uppercase">Providers</p>
                      <p className="font-semibold text-darkgreen text-lg">
                        {centre.totalProviders}
                      </p>
                    </div>

                    <div>
                      <p className="text-cardfooter uppercase">Sessions</p>
                      <p className="font-semibold text-darkgreen text-lg">
                        {centre.totalSessions}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/centre-detail/${centre._id}`)}
                        className="p-2 rounded-lg bg-gray-100 text-darkgreen hover:bg-gray-200"
                      >
                        <AiFillEye />
                      </button>

                      <button
                        onClick={() => navigate(`/edit-centre/${centre._id}`)}
                        className="p-2 rounded-lg bg-darkgreen text-white hover:bg-yellow"
                      >
                        <FiEdit2 />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleCentreStatus(centre)}
                      disabled={centre.totalProviders > 0 && centre.isActive}
                      className={`text-xs px-4 py-1.5 rounded-full ${
                        centre.totalProviders > 0 && centre.isActive
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : centre.isActive
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      {centre.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* <div className="flex justify-end gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="flex items-center">
              Page {page} of {Math.ceil(totalCount / limit)}
            </span>

            <button
              disabled={page >= Math.ceil(totalCount / limit)}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div> */}
        </div>
      ) : (
        /* LIST VIEW  */
        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
          <div className="shadow-md rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-offwhite text-cardfooter uppercase text-left">
                <tr>
                  <SortableHeader
  title="Centre"
  field="fullName"
  sortConfig={sortConfig}
  handleSort={handleSort}
/>
                 <SortableHeader
  title="Email"
  field="email"
  sortConfig={sortConfig}
  handleSort={handleSort}
/>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Providers</th>
                  <th className="p-3 text-left">Sessions</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {centres.map((centre) => (
                  <tr key={centre._id} className=" hover:bg-offwhite/50 text-table-text ">
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
 
    <button
      onClick={() => toggleCentreStatus(centre)}
      disabled={centre.totalProviders > 0 && centre.isActive}
      className={`px-3 py-2 rounded-lg text-xs font-medium ${
        centre.totalProviders > 0 && centre.isActive
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : centre.isActive
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-green-100 text-green-600 hover:bg-green-200"
      }`}
    >
      {centre.isActive ? "Deactivate" : "Activate"}
    </button>
 
</td>

                    <td className="p-3 flex justify-end gap-2">
                      <button className="p-2 bg-gray-100 rounded-lg">
                        <AiFillEye />
                      </button>

                      <button
                        onClick={() => navigate(`/edit-centre/${centre._id}`)}
                        className="p-2 bg-darkgreen text-white rounded-lg"
                      >
                        <FiEdit2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
        
      )}
     <div className="flex justify-end items-center gap-4 mt-6">
  <button
    disabled={page === 1}
    onClick={() => setPage((prev) => prev - 1)}
    className="px-4 py-2 bg-gray-200 rounded-xl disabled:opacity-50"
  >
    Previous
  </button>

  <span className="text-table-text">
    Page {page} of {Math.ceil(totalCount / limit)}
  </span>

  <button
    disabled={page >= Math.ceil(totalCount / limit)}
    onClick={() => setPage((prev) => prev + 1)}
    className="px-4 py-2 bg-darkgreen text-white rounded-xl hover:bg-yellow disabled:opacity-50"
  >
    Next
  </button>
</div>
</div>
  );
};

export default CentreList;
