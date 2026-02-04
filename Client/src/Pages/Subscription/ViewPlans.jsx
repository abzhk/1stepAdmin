import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

const ViewPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useOutletContext();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:3001/api/plan/get?search=${searchTerm}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch plans");
        }

        setPlans(data.plans);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [searchTerm]);

  if (loading) {
    return <p className="p-6">Loading plans...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>;
  }

  return (
    <div className=" bg-offwhite p-6 md:p-6 font-sans text-darkgreen mt-8">
      {/* <h2 className="text-xl font-semibold mb-4">Plans</h2> */}
      <button
        type="button"
        onClick={() => navigate("/add-plans")}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>

      <div className="overflow-x-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 ">
            <tr>
              <th className="p-3 text-left">Sl.no</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Mo/Yr</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Final Price</th>
              <th className="p-3 text-left">Active plans</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{plan.plan_name}</td>
                <td className="p-3">{plan.billing_interval}</td>
                <td className="p-3">{plan.price}</td>
                <td className="p-3">{plan.final_price}</td>
                <td className="p-3">
                  {plan.is_active ? "Active" : "Inactive"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => navigate(`/addplans/${plan._id}`)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <FiEdit2 size={16} />
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

export default ViewPlans;
