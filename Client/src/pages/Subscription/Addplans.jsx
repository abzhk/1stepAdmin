import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Video,
  MessageSquare,
  Library,
  Users,
  BrainCircuit,
  UserCheck,
  Sparkles,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GrView } from "react-icons/gr";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";


const Addplans = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const API = import.meta.env.VITE_API_URL;
  const [modules, setModules] = useState([]);
  const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const mode = searchParams.get("mode");

const isEditMode = !!id && mode !== "version";
const isVersionMode = !!id && mode === "version";


  const [formData, setFormData] = useState({
    plan_key: "basic",
    user_type: "parent",
    plan_name: "",
    slug: "",
    description: "",
    is_featured: false,
    price: "",
    discount: 0,
    currency: "INR",
    billing_interval: "monthly",
    trial_period_days: 0,
    stripe_price_id: "",
    available_modules: [],
    max_messages_per_month: 0,
    max_assessments_per_month: 0,
    max_parents_allowed: 0,
    video_sessions_upload_per_month: 0,
    max_providers_allowed: 1,
    priority_support: false,
    video_sessions_count: 4,
    session_duration_mins: 60,
    chat_access_level: "none",
    resource_library_access: false,
    therapist_matching_type: "auto",
  });

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(`${API}/api/module/get-module`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        setModules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch modules", err);
        setModules([]);
      }
    };

    fetchModules();
  }, []);

  

  useEffect(() => {
    if (!formData.plan_name) return;

    const slug = formData.plan_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({ ...prev, slug }));
  }, [formData.plan_name]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateSessionCount = (delta) => {
    setFormData((prev) => ({
      ...prev,
      video_sessions_count: Math.max(0, prev.video_sessions_count + delta),
    }));
  };

  useEffect(() => {
    if (formData.user_type === "parent") {
      setFormData((prev) => ({
        ...prev,
        max_parents_allowed: 0,
        video_sessions_upload_per_month: 0,
      }));
    }

    if (formData.user_type === "provider") {
      setFormData((prev) => ({
        ...prev,
        max_providers_allowed: 0,
      }));
    }
  }, [formData.user_type]);

  const handleFinalPublishClick = async () => {
  let payload;
  let url;
  let method;

  if (isEditMode) {
    // metadata edit only
    payload = {
      plan_name: formData.plan_name,
      description: formData.description,
      is_featured: formData.is_featured,
    };

    url = `${API}/api/plan/update/${id}`;
    method = "PUT";
  } else {
    payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount),
      trial_period_days: Number(formData.trial_period_days),
      max_messages_per_month: Number(formData.max_messages_per_month),
      max_assessments_per_month: Number(formData.max_assessments_per_month),
      max_providers_allowed: Number(formData.max_providers_allowed),
      max_parents_allowed: Number(formData.max_parents_allowed),
      video_sessions_upload_per_month: Number(
        formData.video_sessions_upload_per_month
      ),
      video_sessions_count: Number(formData.video_sessions_count),
      session_duration_mins: Number(formData.session_duration_mins),
    };

    url = `${API}/api/plan/create`;
    method = "POST";
  }

  try {
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to save plan");
      return;
    }

    toast.success(
      isEditMode
        ? "Plan updated successfully"
        : isVersionMode
        ? "New version created successfully"
        : "Plan created successfully"
    );

    setIsSubmitted(true);
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step < 5) {
      setStep((s) => s + 1);
    }
  };

  const handleView = () => {
    navigate("/view-plans");
  };

  const finalPrice =
    formData.price && formData.discount
      ? Math.round(formData.price - (formData.price * formData.discount) / 100)
      : formData.price;
  useEffect(() => {
    if (!id) return;

    const fetchPlan = async () => {
      const res = await fetch(`${API}/api/plan/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (res.ok) {
        setFormData({
          plan_key: data.plan.plan_key,
          user_type: data.plan.user_type,
          plan_name: data.plan.plan_name,
          slug: data.plan.slug,
          description: data.plan.description,
          is_featured: data.plan.is_featured,
          price: data.plan.price,
          discount: data.plan.discount,
          currency: data.plan.currency,
          billing_interval: data.plan.billing_interval,
          trial_period_days: data.plan.trial_period_days,
          stripe_price_id: data.plan.stripe_price_id,
          available_modules: data.plan.available_modules || [],
          max_messages_per_month: data.plan.max_messages_per_month || 0,
          max_assessments_per_month: data.plan.max_assessments_per_month || 0,
          max_providers_allowed: data.plan.max_providers_allowed || 1,
          priority_support: data.plan.priority_support || false,
          video_sessions_count: data.plan.video_sessions_count,
          max_parents_allowed: data.plan.max_parents_allowed || 0,
          video_sessions_upload_per_month:
            data.plan.video_sessions_upload_per_month || 0,
          session_duration_mins: data.plan.session_duration_mins,
          chat_access_level: data.plan.chat_access_level,
          resource_library_access: data.plan.resource_library_access,
          therapist_matching_type: data.plan.therapist_matching_type,
        });
      }
    };

    fetchPlan();
  }, [id]);

  const toggleModule = (module) => {
    setFormData((prev) => ({
      ...prev,
      available_modules: prev.available_modules.includes(module)
        ? prev.available_modules.filter((m) => m !== module)
        : [...prev.available_modules, module],
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F4F0] p-6 font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8fa797]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#f2a794]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="bg-white max-w-md w-full rounded-[2rem] shadow-2xl p-8 md:p-12 text-center border border-white relative z-10 animate-in zoom-in-95 duration-500 ease-out">
          <div className="relative mb-8 mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#2d4a36]/5 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-[#2d4a36]/10 rounded-full"></div>
            <div className="relative w-20 h-20 bg-[#2d4a36] rounded-full flex items-center justify-center shadow-lg shadow-[#2d4a36]/20">
              <Check className="w-10 h-10 text-[#ffd333] stroke-[3]" />
            </div>

            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#f2a794] rounded-full animate-bounce delay-100"></div>
            <div className="absolute -bottom-1 -left-2 w-3 h-3 bg-[#ffd333] rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-1/2 -right-8 w-2 h-2 bg-[#8fa797] rounded-full"></div>
          </div>

          <div className="space-y-4 mb-10">
            <h2 className="text-3xl font-bold text-[#2d4a36] tracking-tight">
              Plan Published!
            </h2>
            <p className="text-[#8fa797] text-lg leading-relaxed">
              <span className="font-bold text-[#2d4a36]">
                {formData.plan_name}
              </span>{" "}
              is now live and ready to accept subscribers.
            </p>
          </div>

          <div className="bg-[#F6F4F0] rounded-xl p-4 mb-8 flex items-center justify-between border border-[#8fa797]/20">
            <div className="text-left">
              <div className="text-xs text-[#8fa797] font-bold uppercase tracking-wider">
                Price
              </div>
              <div className="text-[#2d4a36] font-bold">
                ₹{formData.price}/
                {formData.billing_interval === "annually" ? "yr" : "mo"}
              </div>
            </div>
            <div className="h-8 w-px bg-[#8fa797]/20"></div>
            <div className="text-right">
              <div className="text-xs text-[#8fa797] font-bold uppercase tracking-wider">
                Status
              </div>
              <div className="text-[#2d4a36] font-bold flex items-center gap-1 justify-end">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                Active
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="group w-full py-4 bg-[#2d4a36] text-white rounded-xl font-bold shadow-xl shadow-[#2d4a36]/10 hover:bg-[#1e3324] hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5 opacity-80 group-hover:opacity-100" />
              Return to Dashboard
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-transparent text-[#8fa797] font-bold rounded-xl hover:text-[#2d4a36] hover:bg-[#F6F4F0] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Another Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4F0] p-6 md:p-12 font-sans text-slate-800 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-8 pl-2">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= s
                        ? "bg-[#2d4a36] text-white"
                        : "bg-white border border-[#8fa797] text-[#8fa797]"
                    }`}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s !== 5 && (
                    <div
                      className={`h-1 w-4 sm:w-8 mx-1 sm:mx-2 rounded ${
                        step > s ? "bg-[#2d4a36]" : "bg-[#8fa797]/30"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs font-bold text-[#8fa797] uppercase tracking-widest pl-1">
              {step === 1 && "Identity"}
              {step === 2 && "Financials"}
              {step === 3 && "Features"}
              {step === 4 && "Limits"}
              {step === 5 && "Review"}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-[#8fa797]/20 flex-1 flex flex-col min-h-[550px]">
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col">
              <div className="p-8 flex-1 overflow-y-auto">
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold text-[#2d4a36]">
                        Plan Identity
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-[#2d4a36]">
                        User Type
                      </label>
                      <select
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleChange}
                        disabled={isEditMode || isVersionMode}
                        className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30 focus:ring-2 focus:ring-[#2d4a36] outline-none text-[#2d4a36]"
                      >
                        <option value="parent">Parent</option>
                        <option value="provider">Provider</option>
                      </select>
                      <div>
                        <label className="text-sm font-bold text-[#2d4a36]">
                          Plan key
                        </label>
                        <select
                          name="plan_key"
                          value={formData.plan_key}
                          onChange={handleChange}
                          disabled={isEditMode || isVersionMode}
                          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30 focus:ring-2 focus:ring-[#2d4a36] outline-none text-[#2d4a36]
                          autoFocus"
                        >
                          <option value="free">Free</option>
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                          <option value="premium">Premium</option>
                        </select>
                        <label className="text-sm font-bold text-[#2d4a36]">
                          Plan Name
                        </label>
                        <input
                          type="text"
                          name="plan_name"
                          value={formData.plan_name}
                          onChange={handleChange}
                          disabled={isVersionMode}
                          placeholder="e.g. Premium Plan"
                          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30 focus:ring-2 focus:ring-[#2d4a36] outline-none text-[#2d4a36]"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-[#2d4a36]">
                          Description
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Briefly describe..."
                          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30 focus:ring-2 focus:ring-[#2d4a36] outline-none resize-none text-[#2d4a36]"
                        />
                      </div>
                      <label className="flex items-center p-4 border border-[#8fa797]/30 rounded-xl hover:bg-[#F6F4F0] cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleChange}
                          className="w-5 h-5 text-[#2d4a36] accent-[#2d4a36] rounded focus:ring-[#2d4a36]"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-bold text-[#2d4a36]">
                            Featured Plan
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold text-[#2d4a36]">
                        Financials
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-[#2d4a36]">
                          Price (INR)
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-3.5 text-[#2d4a36] font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                             disabled={isEditMode}
                            onKeyDown={(e) =>e.key === "." && e.preventDefault()
                            }
                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30 focus:ring-2 focus:ring-[#2d4a36] outline-none text-[#2d4a36] font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-[#2d4a36]">
                          Billing
                        </label>
                        <select
                          name="billing_interval"
                          value={formData.billing_interval}
                          onChange={handleChange}
                           disabled={isEditMode}
                          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30 focus:ring-2 focus:ring-[#2d4a36] outline-none text-[#2d4a36]"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="annually">Annually</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#2d4a36]">
                        Stripe Price ID
                      </label>
                      <input
                        type="text"
                        name="stripe_price_id"
                        value={formData.stripe_price_id}
                        onChange={handleChange}
                         disabled={isEditMode}
                        placeholder="price_..."
                        className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30 focus:ring-2 focus:ring-[#2d4a36] outline-none font-mono text-sm text-[#2d4a36]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#2d4a36]">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                         disabled={isEditMode}
                        onKeyDown={(e) =>e.key === "." && e.preventDefault()}
                        className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-[#2d4a36]">
                        Trial Days
                      </label>
                      <input
                        type="number"
                        name="trial_period_days"
                        value={formData.trial_period_days}
                        onChange={handleChange}
                        min="0"
                        max="7"
                        onKeyDown={(e) => e.key === "." && e.preventDefault()}
                         disabled={isEditMode}
                        className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30 focus:ring-2 focus:ring-[#2d4a36] outline-none text-[#2d4a36]"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                    <div className="flex justify-between items-end">
                      <h2 className="text-2xl font-bold text-[#2d4a36]">
                        Capabilities
                      </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            therapist_matching_type: "auto",
                          })
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                          formData.therapist_matching_type === "auto"
                            ? "border-[#2d4a36] bg-[#F6F4F0] ring-1 ring-[#2d4a36]"
                            : "border-[#F6F4F0] bg-[#F6F4F0] hover:border-[#8fa797]"
                        }`}
                      >
                        <BrainCircuit
                          className={`w-6 h-6 mb-2 ${
                            formData.therapist_matching_type === "auto"
                              ? "text-[#2d4a36]"
                              : "text-[#8fa797]"
                          }`}
                        />
                        <div className="font-bold text-sm text-[#2d4a36]">
                          AI Algorithm
                        </div>
                        {formData.therapist_matching_type === "auto" && (
                          <Check className="absolute top-2 right-2 w-4 h-4 text-[#2d4a36]" />
                        )}
                      </button>

                      <button
                        type="button"
                         disabled={isEditMode}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            therapist_matching_type: "manual",
                          })
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                          formData.therapist_matching_type === "manual"
                            ? "border-[#2d4a36] bg-[#F6F4F0] ring-1 ring-[#2d4a36]"
                            : "border-[#F6F4F0] bg-[#F6F4F0] hover:border-[#8fa797]"
                        }`}
                      >
                        <UserCheck
                          className={`w-6 h-6 mb-2 ${
                            formData.therapist_matching_type === "manual"
                              ? "text-[#2d4a36]"
                              : "text-[#8fa797]"
                          }`}
                        />
                        <div className="font-bold text-sm text-[#2d4a36]">
                          Manual Pick
                        </div>
                        {formData.therapist_matching_type === "manual" && (
                          <Check className="absolute top-2 right-2 w-4 h-4 text-[#2d4a36]" />
                        )}
                      </button>

                      {/* BOTH */}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            therapist_matching_type: "both",
                          })
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                          formData.therapist_matching_type === "both"
                            ? "border-[#2d4a36] bg-[#F6F4F0] ring-1 ring-[#2d4a36]"
                            : "border-[#F6F4F0] bg-[#F6F4F0] hover:border-[#8fa797]"
                        }`}
                      >
                        <Users
                          className={`w-6 h-6 mb-2 ${
                            formData.therapist_matching_type === "both"
                              ? "text-[#2d4a36]"
                              : "text-[#8fa797]"
                          }`}
                        />
                        <div className="font-bold text-sm text-[#2d4a36]">
                          Auto + Manual
                        </div>
                        {formData.therapist_matching_type === "both" && (
                          <Check className="absolute top-2 right-2 w-4 h-4 text-[#2d4a36]" />
                        )}
                      </button>
                    </div>

                    <div className="bg-[#F6F4F0] rounded-xl p-4 border border-[#8fa797]/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs text-[#2d4a36] font-bold uppercase tracking-wide">
                          Sessions / Mo
                        </div>
                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-[#8fa797]/30 shadow-sm">
                          <button
                            type="button"
                            onClick={() => updateSessionCount(-1)}
                             disabled={isEditMode}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F6F4F0] text-[#8fa797] font-bold text-lg"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-[#2d4a36]">
                            {formData.video_sessions_count}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateSessionCount(1)}
                             disabled={isEditMode}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F6F4F0] text-[#2d4a36] font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-[#2d4a36] font-bold uppercase tracking-wide">
                          Duration
                        </div>
                        <div className="flex gap-2">
                          {[30, 45, 60, 90].map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  session_duration_mins: mins,
                                })
                              }
                               disabled={isEditMode}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                formData.session_duration_mins === mins
                                  ? "bg-[#2d4a36] text-white"
                                  : "bg-white text-[#2d4a36] border border-[#8fa797]/30"
                              }`}
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex bg-[#F6F4F0] p-1 rounded-xl border border-[#8fa797]/20">
                      {["none", "limited", "unlimited"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              chat_access_level: opt,
                            })
                          }
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                            formData.chat_access_level === opt
                              ? "bg-white text-[#2d4a36] shadow-sm ring-1 ring-black/5"
                              : "text-[#8fa797] hover:text-[#2d4a36]"
                          }`}
                        >
                          {opt.replace("_", " ")}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            resource_library_access:
                              !prev.resource_library_access,
                          }))
                        }
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          formData.resource_library_access
                            ? "bg-[#2d4a36]/5 border-[#2d4a36] text-[#2d4a36]"
                            : "bg-white border-[#8fa797]/30 text-[#8fa797] grayscale"
                        }`}
                      >
                        <Library className="w-5 h-5" />
                        <span className="block text-xs font-bold">Library</span>
                      </button>

                      {formData.user_type === "provider" && (
                        <>
                          <div>
                            <label className="text-sm font-bold text-[#2d4a36]">
                              Video Upload / Month
                            </label>
                            <input
                              type="number"
                              name="video_sessions_upload_per_month"
                              min="0"
                              value={formData.video_sessions_upload_per_month}
                              onChange={handleChange}
                              className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-[#2d4a36] mb-3">
                        Available Modules
                      </h3>

                      <div className="grid grid-cols-2 gap-3">
                        {Array.isArray(modules) &&
                          modules.map((mod) => (
                            <button
                              key={mod._id}
                              type="button"
                              onClick={() => toggleModule(mod._id)}
                              className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${
                                formData.available_modules.includes(mod._id)
                                  ? "bg-[#2d4a36] text-white border-[#2d4a36]"
                                  : "bg-white text-[#2d4a36] border-[#8fa797]/30 hover:bg-[#F6F4F0]"
                              }`}
                            >
                              {mod.modules.replace("_", " ")}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-[#2d4a36]">
                        Usage Limits
                      </h2>
                      <p className="text-sm text-[#8fa797]">
                        Set monthly limits
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Messages */}
                      <div>
                        <label className="text-sm font-bold text-[#2d4a36]">
                          Max Messages / Month
                        </label>
                        <input
                          type="number"
                          name="max_messages_per_month"
                          min="0"
                          value={formData.max_messages_per_month}
                          onChange={handleChange}
                          onKeyDown={(e) => e.key === "." && e.preventDefault()}
                          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30"
                        />
                      </div>

                      {/* Assessments */}
                      <div>
                        <label className="text-sm font-bold text-[#2d4a36]">
                          Max Assessments / Month
                        </label>
                        <input
                          type="number"
                          name="max_assessments_per_month"
                          min="0"
                          value={formData.max_assessments_per_month}
                          onChange={handleChange}
                          onKeyDown={(e) => e.key === "." && e.preventDefault()}
                          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30"
                        />
                      </div>

                      {/* Providers */}
                      {formData.user_type === "parent" && (
                        <div>
                          <label className="text-sm font-bold text-[#2d4a36]">
                            Max Providers Allowed
                          </label>
                          <input
                            type="number"
                            name="max_providers_allowed"
                            min="1"
                            value={formData.max_providers_allowed}
                            onChange={handleChange}
                            onKeyDown={(e) =>
                              e.key === "." && e.preventDefault()
                            }
                            className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30"
                          />
                        </div>
                      )}
                      {formData.user_type === "provider" && (
                        <>
                          <div>
                            <label className="text-sm font-bold text-[#2d4a36]">
                              Max Parents Allowed
                            </label>
                            <input
                              type="number"
                              name="max_parents_allowed"
                              min="0"
                              value={formData.max_parents_allowed}
                              onChange={handleChange}
                              onKeyDown={(e) =>
                                e.key === "." && e.preventDefault()
                              }
                              className="mt-1 w-full px-4 py-3 rounded-xl bg-[#F6F4F0] border border-[#8fa797]/30"
                            />
                          </div>
                        </>
                      )}
                      {/* Priority Support */}
                      <label className="flex items-center gap-3 p-4 border border-[#8fa797]/30 rounded-xl cursor-pointer hover:bg-[#F6F4F0]">
                        <input
                          type="checkbox"
                          name="priority_support"
                          checked={formData.priority_support}
                          onChange={handleChange}
                          className="w-5 h-5 accent-[#2d4a36]"
                        />
                        <span className="text-sm font-bold text-[#2d4a36]">
                          Priority Support
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-[#2d4a36]">
                        Review Plan
                      </h2>
                      <p className="text-[#8fa797] text-sm">
                        Double check everything before going live.
                      </p>
                    </div>

                    <div className="bg-[#F6F4F0] rounded-2xl p-5 space-y-4 border border-[#8fa797]/30">
                      <div className="flex justify-between items-center border-b border-[#8fa797]/20 pb-3">
                        <span className="text-sm text-[#8fa797] font-medium">
                          Name
                        </span>
                        <span className="font-bold text-[#2d4a36]">
                          {formData.plan_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#8fa797]/20 pb-3">
                        <span className="text-sm text-[#8fa797] font-medium">
                          Price
                        </span>
                        <span className="font-bold text-[#2d4a36]">
                          ₹{formData.price} / {formData.billing_interval}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#8fa797]/20 pb-3">
                        <span className="text-sm text-[#8fa797] font-medium">
                          Video Sessions
                        </span>
                        <span className="font-bold text-[#2d4a36]">
                          {formData.video_sessions_count}{" "}
                          <span className="text-[#8fa797] text-xs font-normal">
                            ({formData.session_duration_mins}m)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#8fa797]/20 pb-3">
                        <span className="text-sm text-[#8fa797] font-medium">
                          Chat
                        </span>
                        <span className="font-bold text-[#2d4a36] capitalize">
                          {formData.chat_access_level.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#8fa797] font-medium">
                          Status
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#8fa797]/20 text-[#2d4a36]">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-[#2d4a36]/5 rounded-xl border border-[#2d4a36]/10">
                        <span className="block text-xs text-[#2d4a36] font-bold uppercase">
                          Matching
                        </span>
                        <span className="text-sm font-semibold text-[#2d4a36]">
                          {formData.therapist_matching_type}
                        </span>
                      </div>
                      <div className="flex-1 p-3 bg-[#f2a794]/10 rounded-xl border border-[#f2a794]/30">
                        <span className="block text-xs text-[#d68571] font-bold uppercase">
                          Library
                        </span>
                        <span className="text-sm font-semibold text-[#2d4a36]">
                          {formData.resource_library_access
                            ? "Included"
                            : "No Access"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[#8fa797]/20 bg-[#F6F4F0] rounded-b-3xl flex justify-between items-center">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="text-[#8fa797] hover:text-[#2d4a36] font-medium flex items-center gap-2 px-3 py-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="bg-[#2d4a36] hover:bg-[#1e3324] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#2d4a36]/20 transition-all"
                  >
                    {step === 4 ? "Review Plan" : "Next Step"}{" "}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalPublishClick}
                    className="bg-[#8fa797] hover:bg-[#7a9181] text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-[#8fa797]/30 transition-all transform hover:-translate-y-0.5"
                  >
                   {isEditMode ? "Update Plan" : "Confirm & Publish"}
 <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5 hidden lg:block">
          <button
            onClick={handleView}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-yellow border rounded-lg bg-peach text-darkgreen"
          >
            <GrView className="text-darkgreen" />
            List View
          </button>
          <div className="sticky top-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8fa797] mb-4 ml-1">
              Live Preview
            </h3>
            <div
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-500 ${
                formData.is_featured
                  ? "border-[#ffd333] shadow-xl"
                  : "border-transparent shadow-lg"
              }`}
            >
              {formData.is_featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f2a794] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase shadow-md">
                  Most Popular
                </div>
              )}
              <div className="text-center mt-2">
                <h3 className="text-2xl font-bold text-[#2d4a36]">
                  {formData.plan_name || "Untitled Plan"}
                </h3>
                <div className="mt-4 flex items-baseline justify-center text-[#2d4a36]">
                  <span className="text-5xl font-extrabold tracking-tight">
                    ₹{finalPrice || "0"}
                  </span>
                  <span className="ml-1 text-xl font-medium text-[#8fa797]">
                    /{formData.billing_interval === "annually" ? "yr" : "mo"}
                  </span>
                </div>
                <p className="mt-4 text-sm text-[#8fa797]">
                  {formData.description || "Description..."}
                </p>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-[#8fa797]" />
                  <span className="text-sm font-medium text-[#2d4a36]">
                    <strong>{formData.video_sessions_count}</strong> Sessions (
                    {formData.session_duration_mins}m)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[#8fa797]" />
                  <span className="text-sm font-medium text-[#2d4a36] capitalize">
                    {formData.chat_access_level.replace(/_/g, " ")} Chat
                  </span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    formData.resource_library_access
                      ? ""
                      : "opacity-40 grayscale"
                  }`}
                >
                  <Library className="w-4 h-4 text-[#8fa797]" />
                  <span className="text-sm font-medium text-[#2d4a36]">
                    Resource Library
                  </span>
                </div>
              </div>
              <button className="mt-8 w-full py-3.5 rounded-xl font-bold text-sm bg-[#F6F4F0] text-[#2d4a36] border border-[#2d4a36]/10 hover:bg-[#2d4a36] hover:text-white transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addplans;
