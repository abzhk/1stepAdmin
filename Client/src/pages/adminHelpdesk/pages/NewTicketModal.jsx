import { useState } from "react";
import { AGENTS } from "../data/mockData";


//UI designed By Gokul
export default function NewTicketModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ user: "", email: "", title: "", cat: "Billing", priority: "Medium", agent: "" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const e = {};
    if (!form.user.trim()) e.user = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.title.trim()) e.title = "Required";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({ id: "TKT-" + (2042 + Math.floor(Math.random() * 100)), ...form, initials: form.user.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(), status: "Open", agent: form.agent || null, created: "Just now", messages: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#2d4a36]/20 backdrop-blur-sm" />
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg border border-[#8fa797]/20 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-[#8fa797]/10 flex items-center justify-between bg-[#F6F4F0]/50">
          <div>
            <h2 className="text-[16px] font-bold text-[#2d4a36] tracking-tight">Create new ticket</h2>
            <p className="text-[12px] font-medium text-[#8fa797] mt-0.5">Fill in the details to open a support request</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa797] hover:bg-white shadow-sm transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </button>
        </div>
        
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {[{ k: "user", label: "Full name", ph: "Aruna Sharma" }, { k: "email", label: "Email", ph: "user@example.com" }].map(f => (
              <div key={f.k}>
                <label className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest block mb-1.5">{f.label} *</label>
                <input value={form[f.k]} onChange={set(f.k)} placeholder={f.ph} className={`w-full text-[13px] font-medium px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8fa797]/40 transition-all ${errors[f.k] ? "border-[#f2a794] bg-[#f2a794]/5 ring-1 ring-[#f2a794]/30" : "border-[#8fa797]/30 bg-[#F6F4F0]/50"}`} />
                {errors[f.k] && <p className="text-[11px] font-bold text-[#f2a794] mt-1.5">{errors[f.k]}</p>}
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest block mb-1.5">Issue title *</label>
            <input value={form.title} onChange={set("title")} placeholder="Brief description of the issue" className={`w-full text-[13px] font-medium px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8fa797]/40 transition-all ${errors.title ? "border-[#f2a794] bg-[#f2a794]/5 ring-1 ring-[#f2a794]/30" : "border-[#8fa797]/30 bg-[#F6F4F0]/50"}`} />
            {errors.title && <p className="text-[11px] font-bold text-[#f2a794] mt-1.5">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { k: "cat", label: "Category", opts: ["Billing", "Technical", "Booking", "Account", "General"] },
              { k: "priority", label: "Priority", opts: ["High", "Medium", "Low"] },
              { k: "agent", label: "Assign to", opts: ["", ...AGENTS.map(a => a.name)], display: v => v || "Unassigned" },
            ].map(f => (
              <div key={f.k}>
                <label className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest block mb-1.5">{f.label}</label>
                <select value={form[f.k]} onChange={set(f.k)} className="w-full text-[12px] font-medium px-3 py-2.5 border border-[#8fa797]/30 rounded-xl bg-[#F6F4F0]/50 text-[#2d4a36] focus:outline-none focus:ring-2 focus:ring-[#8fa797]/40 cursor-pointer">
                  {f.opts.map(o => <option key={o} value={o}>{o || "Unassigned"}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-[#8fa797]/10 flex justify-end gap-3 bg-[#F6F4F0]/30">
          <button onClick={onClose} className="text-[13px] font-bold px-5 py-2.5 border border-[#8fa797]/30 rounded-full text-[#2d4a36] hover:bg-white transition-colors">Cancel</button>
          <button onClick={submit} className="text-[13px] font-bold px-6 py-2.5 bg-[#2d4a36] text-[#F6F4F0] rounded-full hover:bg-[#8fa797] hover:text-[#2d4a36] shadow-md shadow-[#2d4a36]/10 transition-all">Create Ticket</button>
        </div>
      </div>
    </div>
  );
}