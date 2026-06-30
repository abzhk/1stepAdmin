import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { AiFillEye } from "react-icons/ai";
import { api } from "../../utils/api";

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
<div className="bg-white rounded-2xl shadow-md p-6 mb-6">
  <div className="flex items-center justify-between pb-4 mb-5">
    <div>
      <h1 className="text-2xl font-bold text-green-900 uppercase">
        {centre.fullName}
      </h1>
    </div>

    {centre.profilePicture && (
      <img
        src={centre.profilePicture}
        alt={centre.fullName}
        className="w-20 h-20 rounded-full object-cover "
      />
    )}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

    <div className="bg-offwhite rounded-xl p-4">
      <p className="  text-cardfooter mb-1">Email</p>
      <p className="text-label break-all">{centre.email}</p>
    </div>

    <div className="bg-offwhite rounded-xl p-4">
      <p className=" text-cardfooter mb-1">Phone</p>
      <p className="text-label">{centre.phone}</p>
    </div>

    <div className="bg-offwhite rounded-xl p-4">
      <p className=" text-cardfooter mb-1">Qualification</p>
      <p className="text-label">{centre.qualification}</p>
    </div>

    <div className="bg-offwhite rounded-xl p-4">
      <p className=" text-cardfooter mb-1">Experience</p>
      <p className="text-label">{centre.experience} Years</p>
    </div>

  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

    <div className="bg-offwhite rounded-xl p-4">
      <p className="  text-cardfooter mb-2">Address</p>

      <p className="text-label">
        {[
          centre.address?.addressLine1,
          centre.address?.street,
          centre.address?.city,
          centre.address?.state,
          centre.address?.country,
          centre.address?.pincode,
        ]
          .filter(Boolean)
          .join(", ")}
      </p>
    </div>

    <div className="bg-offwhite rounded-xl p-4">
      <p className="text-cardfooter mb-2">Services</p>

      <div className="flex flex-wrap gap-2">
        {centre.name?.map((service, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-greenmuted text-yellow  text-tab-subheading rounded-full text-sm"
          >
            {service}
          </span>
        ))}
      </div>
    </div>

  </div>

  {centre.description && (
    <div className="mt-5 bg-offwhite rounded-xl p-4">
      <p className="text-cardfooter mb-2">Description</p>

      <p className="text-label leading-7">
        {centre.description}
      </p>
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

      <div className="bg-white rounded-2xl shadow overflow-hidden">

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