import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { formatDecimal } from "../../utils/formatdecimal.js";
import { TfiReload } from "react-icons/tfi";
import{api} from "../../utils/api.js";


const ViewPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useOutletContext();
  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();


  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);

        const data = await api(
          `/api/plan/get?search=${searchTerm}&page=${page}&limit=10`
        );

        setPlans(data.plans);
setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [searchTerm,page]);

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
        <table className="w-full border-collapse ">
          <thead className="bg-offwhite text-cardfooter uppercase ">
            <tr>
              <th className="p-3 text-left">Sl.no</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Version</th>
              <th className="p-3 text-left">User</th>
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
                className=" hover:bg-offwhite/60  text-table-text border-t border-slate-100 transition-colors duration-200 cursor-pointer"
              >
                <td className="p-3">{(page - 1) * 10 + index + 1}</td>
                <td className="p-3  uppercase">{plan.plan_name}</td>
                 <td className="p-3  uppercase">{plan.version_number}</td>
                 <td className="p-3">{plan.user_type}</td>
                <td className="p-3">{plan.billing_interval}</td>
                <td className="p-3">{formatDecimal(plan.price)}</td>
                <td className="p-3">{formatDecimal(plan.final_price)}</td>
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

                  <button
    onClick={() => navigate(`/addplans/${plan._id}?mode=version`)}
    className="p-2 rounded-lg text-darkgreen hover:bg-green-50"
  >
    <TfiReload size={16} />
  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end items-center gap-4 mt-6">
  <button
    disabled={page === 1}
    onClick={() => setPage((prev) => prev - 1)}
    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
  >
    Previous
  </button>

  <span className="font-medium">
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

export default ViewPlans;
