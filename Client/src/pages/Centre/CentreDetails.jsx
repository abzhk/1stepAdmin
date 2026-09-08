import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { AiFillEye } from "react-icons/ai";
import { api } from "../../utils/api";
import {
  FiPhone,
  FiBookOpen,
  FiAward,
  FiUsers,
  FiMapPin,
  FiGrid,
  FiBriefcase,
} from "react-icons/fi";

const CentreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [centre, setCentre] = useState(null);
  const [providers, setProviders] = useState([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api(`/api/provider/centre-details/${id}`);

        setCentre(res.centre);
        setProviders(res.providers || []);
        setTotalProviders(res.totalProviders || 0);
        setTotalSessions(res.totalSessions || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetails();
  }, [id]);

  if (!centre) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-offwhite min-h-screen">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-darkgreen"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>

<div className="space-y-5">

      {/* =====================================================
          TOP SECTION - PROFILE + BASIC INFORMATION
      ===================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ===================================================
            LEFT - PROFILE CARD
        =================================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Green Header */}
          <div className="h-20 bg-green-900 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-darkgreen to-green-700/20" />
          </div>

          <div className="px-6 pb-6">

            {/* Profile Image */}
            <div className="flex justify-center -mt-12 relative">

              <div className="p-1.5 bg-white rounded-full shadow-md">

                {centre.profilePicture ? (
                  <img
                    src={centre.profilePicture}
                    alt={centre.fullName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-900">
                      {centre.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}

              </div>

            </div>


            {/* Centre Name + Status */}
            <div className="text-center mt-4">

              <h1 className="text-xl font-bold text-green-900">
                {centre.fullName}
              </h1>

              {/* Status */}
              <div className="flex justify-center mt-2">

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    centre.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >

                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      centre.isActive
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />

                  {centre.isActive ? "Active" : "Inactive"}

                </span>

              </div>

            </div>


            {/* Email */}
            <div className="mt-5 pt-5 border-t border-gray-100">

              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Email
              </p>

              <p className="text-sm text-gray-700 break-all">
                {centre.email || "-"}
              </p>

            </div>

          </div>

        </div>


        {/* RIGHT - BASIC INFORMATION CARD */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Centre Information
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Basic information about this centre
              </p>

            </div>

          </div>


          {/* Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* PHONE */}
            <div className="group rounded-xl bg-offwhite border border-gray-100 p-4  transition">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-lg bg-greenmuted flex items-center justify-center shrink-0">
                  <FiPhone
                    className="text-white"
                    size={18}
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Phone
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {centre.phone || "-"}
                  </p>

                </div>

              </div>

            </div>


            {/* QUALIFICATION */}
            <div className="group rounded-xl bg-offwhite border border-gray-100 p-4   transition">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-lg bg-greenmuted flex items-center justify-center shrink-0">
                  <FiBookOpen
                    className="text-white"
                    size={18}
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Qualification
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {centre.qualification || "-"}
                  </p>

                </div>

              </div>

            </div>


            {/* EXPERIENCE */}
            <div className="group rounded-xl bg-offwhite border border-gray-100 p-4   transition">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-lg bg-greenmuted flex items-center justify-center shrink-0">
                  <FiAward
                    className="text-white"
                    size={18}
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Experience
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {centre.experience
                      ? `${centre.experience} Years`
                      : "-"}
                  </p>

                </div>

              </div>

            </div>


            {/*  PROVIDERS*/}
            <div className="group rounded-xl bg-offwhite border border-gray-100 p-4   transition">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-lg bg-greenmuted flex items-center justify-center shrink-0">
                  <FiUsers
                    className="text-white"
                    size={18}
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Providers
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {centre.totalProviders ?? 0}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ADDRESS + SERVICES
      ===================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ===================================================
            ADDRESS CARD
        =================================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-xl bg-greenmuted flex items-center justify-center">
              <FiMapPin
                className="text-white"
                size={18}
              />
            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                Address
              </h2>

              <p className="text-xs text-gray-400">
                Centre location
              </p>

            </div>

          </div>


          {/* Address Content */}
          <div className="rounded-xl bg-offwhite border border-gray-100 p-4">

            <p className="text-sm leading-6 text-gray-700">

              {[
                centre.address?.addressLine1,
                centre.address?.street,
                centre.address?.city,
                centre.address?.state,
                centre.address?.country,
                centre.address?.pincode,
              ]
                .filter(Boolean)
                .join(", ") || "-"}

            </p>

          </div>

        </div>


        {/* ===================================================
            SERVICES CARD
        =================================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-xl bg-greenmuted flex items-center justify-center">
              <FiBriefcase
                className="text-white"
                size={18}
              />
            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                Services
              </h2>

              <p className="text-xs text-gray-400">
                Services offered by the centre
              </p>

            </div>

          </div>


          {/* Services */}
          <div className="flex flex-wrap gap-1">

            {centre.name?.length > 0 ? (

              centre.name.map((service, index) => (

                <span
                  key={index}
                  className="px-3 py-2 rounded-2xl bg-darkgreen border border-green-100 text-yellow text-cardfooter font-medium"
                >
                  {service}
                </span>

              ))

            ) : (

              <span className="text-sm text-gray-400">
                No services available
              </span>

            )}

          </div>

        </div>

      </div>


      {/* SPECIALIZATIONS */}
      {centre.specialization?.length > 0 && (

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-xl bg-greenmuted flex items-center justify-center">
              <FiGrid
                className="text-white"
                size={18}
              />
            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                Specializations
              </h2>

              <p className="text-xs text-gray-400">
                Areas of specialization
              </p>

            </div>

          </div>


          {/* Specialization List */}
          <div className="flex flex-wrap gap-1">

            {centre.specialization.map((specialization) => (

              <span
                key={specialization._id}
                className="px-3 py-2 rounded-2xl bg-darkgreen border border-green-100 text-yellow text-cardfooter font-medium"
              >
                {specialization.name}
              </span>

            ))}

          </div>

        </div>

      )}

    </div>



      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Total Providers</p>
          <h2 className="text-3xl font-bold text-green-900 mt-2">
            {totalProviders}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Total Sessions</p>
          <h2 className="text-3xl font-bold text-green-900 mt-2">
            {}
          </h2>
        </div>

      </div> */}

      <div className="bg-white rounded-2xl shadow overflow-hidden mt-4">

        <div className="p-4 ">
          <h2 className="text-outerheader">
            Invited Providers
          </h2>
        </div>
<div className="p-4">
    <div className="overflow-hidden rounded-b-2xl shadow-md">
        <table className="w-full rounded-2xl">

          <thead className="bg-offwhite text-cardfooter uppercase text-left">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Sessions</th>
              <th className="p-3 text-left">Status</th>
              {/* <th className="p-3 text-right">Action</th> */}
            </tr>
          </thead>

          <tbody>
            {providers.map((p) => (
              <tr key={p._id} className=" hover:bg-offwhite text-table-text">

                <td className="p-3 text-table-text">{p.name}</td>
                <td className="p-3 text-table-text">{p.email}</td>
                <td className="p-3 text-table-text">{p.phone}</td>
                <td className="p-3 text-table-text">{p.sessions}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                {/* <td className="p-3 text-right">
                  <button
                    onClick={() => navigate(`/provider/${p._id}`)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <AiFillEye />
                  </button>
                </td> */}

              </tr>
            ))}
          </tbody>

        </table>
        </div>
</div>
      </div>

    </div>
  );
};

export default CentreDetails;