import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dateFormatUtils from "../../utils/dateFormatUtils";
import { useOutletContext } from "react-router-dom";

const UserReport = () => {
  const API = import.meta.env.VITE_API_URL;

  const [parents, setParents] = useState([]);
  const [providers, setProviders] = useState([]);
  const [userType, setUserType] = useState("Parent");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { searchTerm } = useOutletContext();



  useEffect(() => {
    if (userType !== "Parent") return;

    const fetchParents = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API}/api/parent/getallparents?searchTerm=${searchTerm}&page=${page}&limit=${limit}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Failed to fetch parents");

        const data = await res.json();

        setParents(data.parents || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError("Unable to load parents");
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
  }, [API, searchTerm, userType, page, limit]);


  useEffect(() => {
    if (userType !== "Provider") return;

    const fetchProviders = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API}/api/provider/getproviders?searchTerm=${searchTerm}&page=${page}&limit=${limit}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Failed to fetch providers");

        const data = await res.json();

        setProviders(data.providers || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError("Unable to load providers");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [API, searchTerm, userType, page, limit]);


  const exportToExcel = () => {
    let exportData = [];

    if (userType === "Parent") {
      exportData = parents.map((parent) => ({
        Name: parent.parentDetails?.fullName || "-",
        Mobile: parent.parentDetails?.phoneNumber || "-",
        Email: parent.userRef?.email || "-",
        createdAt: dateFormatUtils(parent.createdAt) || "-",
        UserType: "Parent",
      }));
    }

    if (userType === "Provider") {
      exportData = providers.map((provider) => ({
        Name: provider.fullName || "-",
        Mobile: provider.phone || "-",
        Email: provider.email || "-",
        ProviderType: provider.providerType || "-",
        Qualification: provider.qualification || "-",
        Experience: provider.experience || "-",
      }));
    }

    if (exportData.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, userType);

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, `${userType}_Report.xlsx`);
  };


  useEffect(() => {
    setPage(1);
  }, [userType, searchTerm]);



  return (
    <div className="p-6 bg-offwhite min-h-screen">
     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            User Report
          </h1>

          <div className="flex gap-4">
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="Parent">Parent</option>
              <option value="Provider">Provider</option>
            </select>

            <button
              onClick={exportToExcel}
              className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition"
            >
              Export
            </button>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}

        <div className="overflow-hidden rounded-xl border border-gray-200">
  <table className="min-w-full text-sm">
    <thead className="bg-[#f6f4f0] text-gray-600 uppercase text-xs tracking-wider">
      <tr>
        <th className="px-6 py-4 text-left">Name</th>
        <th className="px-6 py-4 text-left">Mobile</th>
        <th className="px-6 py-4 text-left">Email</th>
        <th className="px-6 py-4 text-left">Created At</th>
        <th className="px-6 py-4 text-left">
          {userType === "Parent" ? "User Type" : "Provider Type"}
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100 bg-white">
      {userType === "Parent" &&
        parents.map((parent) => (
          <tr
            key={parent._id}
            className="hover:bg-gray-50 transition duration-150"
          >
            <td className="px-6 py-4 font-medium text-gray-800">
              {parent.parentDetails?.fullName || "-"}
            </td>
            <td className="px-6 py-4 text-gray-600">
              {parent.parentDetails?.phoneNumber || "-"}
            </td>
            <td className="px-6 py-4 text-gray-600">
              {parent.userRef?.email || "-"}
            </td>
            <td className="px-6 py-4 text-gray-500">
              {dateFormatUtils(parent.createdAt) || "-"}
            </td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 text-xs font-semibold rounded-full ">
                Parent
              </span>
            </td>
          </tr>
        ))}

      {userType === "Provider" &&
        providers.map((provider) => (
          <tr
            key={provider._id}
            className="hover:bg-gray-50 transition duration-150"
          >
            <td className="px-6 py-4 font-medium text-gray-800">
              {provider.fullName || "-"}
            </td>
            <td className="px-6 py-4 text-gray-600">
              {provider.phone || "-"}
            </td>
            <td className="px-6 py-4 text-gray-600">
              {provider.email || "-"}
            </td>
            <td className="px-6 py-4 text-gray-500">
              {dateFormatUtils(provider.createdAt) || "-"}
            </td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 text-xs font-semibold rounded-full ">
                {provider.providerType || "-"}
              </span>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div>

        <div className="flex justify-end items-end mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserReport;