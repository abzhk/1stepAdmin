import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { AiFillEye } from "react-icons/ai";

const CentreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const centre = {
    id,
    name: "Step Therapy Centre",
    totalProviders: 6,
    totalSessions: 40,
  };

  const providers = [
    {
      id: "p1",
      name: "Dr. Karthick",
      email: "Karthick@gmail.com",
      phone: "+91 9965765678",
      sessions: 10,
      status: "Active",
    },
    {
      id: "p2",
      name: "Dr. Jeba Singh",
      email: "jebasingh@gmail.com",
      phone: "+91 9977659808",
      sessions: 8,
      status: "Active",
    },
    {
      id: "p3",
      name: "Dr. Ravi",
      email: "Ravi@gmail.com",
      phone: "+91 8787676565",
      sessions: 5,
      status: "Inactive",
    },
  ];

  return (
    <div className="p-6 bg-offwhite min-h-screen">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-darkgreen"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>


      <h1 className="text-2xl font-bold text-green-900 mb-6">
        {centre.name}
      </h1>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Total Providers</p>
          <h2 className="text-3xl font-bold text-green-900 mt-2">
            {centre.totalProviders}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Total Sessions</p>
          <h2 className="text-3xl font-bold text-green-900 mt-2">
            {centre.totalSessions}
          </h2>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-green-900">
            Invited Providers
          </h2>
        </div>

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Sessions</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">

                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">{p.phone}</td>
                <td className="p-3">{p.sessions}</td>

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

                <td className="p-3 text-right">
                  <button
                    onClick={() =>
                      navigate(`/provider/${p.id}`)
                    }
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <AiFillEye />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
};

export default CentreDetails;