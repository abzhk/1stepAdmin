import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPop, setShowPop] = useState(false);
  const [selected, setSelected] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/plan/get");
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
  }, []);

  if (loading) {
    return <p className="p-6">Loading plans...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>;
  }

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3001/api/plan/delete/${selected}`, {
        method: "DELETE",
      });

      setPlans(plans.filter((plan) => plan._id !== selected));
      setShowPop(false);
      setSelected(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className=" bg-offwhite p-6 md:p-12 font-sans text-darkgreen mt-8">
      <h2 className="text-xl font-semibold mb-4">Plans</h2>

      <div className="overflow-x-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 ">
            <tr>
              <th className="p-3 text-left">Sl.no</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Mo/Yr</th>
              <th className="p-3 text-left">Price</th>
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
                <td className="p-3">
                  {plan.is_active ? "Active" : "Inactive"}
                </td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => navigate(`/addplans/${plan._id}`)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50">
                    <FiEdit2 size={16} />
                  </button>

                  <button
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSelected(plan._id);
                      setShowPop(true);
                    }}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPop && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Delete Plan</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this plan? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPop(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default Plans;
