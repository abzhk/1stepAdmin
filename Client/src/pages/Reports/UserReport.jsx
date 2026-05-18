import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dateFormatUtils from "../../utils/dateFormatUtils";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "../../utils/api.js";

const UserReport = () => {
  const [parents, setParents] = useState([]);
  const [providers, setProviders] = useState([]);
  const [userType, setUserType] = useState("Parent");
  const navigate =useNavigate()

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
        setError(null);

        const data = await api(
          `/api/parent/getallparents?searchTerm=${searchTerm}&page=${page}&limit=${limit}`
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch parents");
        }

        setParents(data.parents || []);
        setProviders([]);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError("Unable to load parents");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
  }, [searchTerm, userType, page, limit]);

  useEffect(() => {
    if (
      userType !== "Provider" &&
      userType !== "ProviderIndividual" &&
      userType !== "ProviderCentre"
    ) {
      return;
    }

    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        const startIndex = (page - 1) * limit;

        let url = `/api/provider/getproviders?searchTerm=${searchTerm}&startIndex=${startIndex}&limit=${limit}`;

        if (userType === "ProviderIndividual") {
          url += `&providerType=individual`;
        }

        if (userType === "ProviderCentre") {
          url += `&providerType=centre`;
        }

        const data = await api(url);

        if (!data.providers) {
          throw new Error("Failed to fetch providers");
        }

        setProviders(data.providers || []);
        setParents([]);
        setTotalPages(Math.ceil((data.totalCount || 0) / limit));
      } catch (err) {
        setError("Unable to load providers");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [searchTerm, userType, page, limit]);

  const exportToExcel = () => {
    let exportData = [];
    let fileName = "Report.xlsx";
    let sheetName = "Report";

    if (userType === "Parent") {
      exportData = parents.map((parent) => ({
        Name: parent.parentDetails?.fullName || "-",
        Mobile: parent.parentDetails?.phoneNumber || "-",
        Email: parent.userRef?.email || "-",
        CreatedAt: dateFormatUtils(parent.createdAt) || "-",
        UserType: "Parent",
      }));

      fileName = "Parent_Report.xlsx";
      sheetName = "Parent";
    }

    if (
      userType === "Provider" ||
      userType === "ProviderIndividual" ||
      userType === "ProviderCentre"
    ) {
      exportData = providers.map((provider) => ({
        Name: provider.fullName || "-",
        Mobile: provider.phone || "-",
        Email: provider.email || "-",
        CreatedAt: dateFormatUtils(provider.createdAt) || "-",
        ProviderType: provider.providerType || "-",
        Qualification: provider.qualification || "-",
        Experience: provider.experience || "-",
      }));

      if (userType === "Provider") {
        fileName = "Provider_Report.xlsx";
        sheetName = "Provider";
      } else if (userType === "ProviderIndividual") {
        fileName = "Provider_Individual_Report.xlsx";
        sheetName = "Individual";
      } else {
        fileName = "Provider_Centre_Report.xlsx";
        sheetName = "Centre";
      }
    }

    if (exportData.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, fileName);
  };

  useEffect(() => {
    setPage(1);
  }, [userType, searchTerm]);

  const isParent = userType === "Parent";
  const isProvider =
    userType === "ProviderIndividual" ||
    userType === "ProviderCentre";

  return (
    <div className="p-6 bg-offwhite min-h-screen">
      <button
        onClick={() => navigate("/reportdashboard")}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Report</h1>

          <div className="flex gap-4">
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="Parent">Parent</option>
              <option value="ProviderIndividual">Provider - Individual</option>
              <option value="ProviderCentre">Provider - Centre</option>
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
                  {isParent ? "User Type" : "Provider Type"}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {isParent &&
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
                      <span className="px-3 py-1 text-xs font-semibold rounded-full">
                        Parent
                      </span>
                    </td>
                  </tr>
                ))}

              {isProvider &&
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
                      <span className="px-3 py-1 text-xs font-semibold rounded-full">
                        {provider.providerType || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end items-center gap-4 mt-6">
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