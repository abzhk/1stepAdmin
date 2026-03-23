import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { api } from "../../utils/api";

const PlanCard = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPlan();
  }, []);

  const fetchFeaturedPlan = async () => {
    try {
      const res = await api("/api/plan/featured"); 
      setPlan(res.plan);
    } catch (err) {
      console.error("Error fetching featured plan:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-95 bg-white rounded-4xl shadow-sm border border-gray-200 p-6 flex items-center justify-center">
        <p className="text-gray-500">Loading plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-95 bg-white rounded-4xl shadow-sm border border-gray-200 p-6 flex items-center justify-center">
        <p className="text-red-500">No plan found</p>
      </div>
    );
  }

  return (
    <div className="h-95 bg-white rounded-4xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800">
            {plan.plan_name}
          </h3>

          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
            Active
          </span>
        </div>

        <h2 className="text-2xl font-bold text-darkgreen mb-1">
          {plan.plan_name} 
        </h2>

        <p className="text-sm text-gray-500 mb-5">
          ₹{plan.final_price} / {plan.billing_interval}
        </p>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Users Limit</span>
            <span className="font-medium text-gray-800">
              {plan.max_providers_allowed}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Billing Cycle</span>
            <span className="font-medium text-gray-800">
              {plan.billing_interval}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-medium text-gray-800">
              v{plan.version_number}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate("/view-plans")}
          className="bg-darkgreen text-white p-3 rounded-full hover:scale-105 transition"
        >
          <FiArrowRight className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default PlanCard;