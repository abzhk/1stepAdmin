import React from "react";

function StatsRow({ data, onFilterClick }) {
  const stats = [
    { label: "Total",    value: data.length,                                             textCls: "text-[#2d4a36]", bgCls: "bg-[#F6F4F0]",    borderCls: "border-[#8fa797]/30", filter: "all" },
    { label: "Submitted",  value: data.filter(d => d.overall === "pending").length,  textCls: "text-[#2d4a36]", bgCls: "bg-[#ffd333]/20", borderCls: "border-[#ffd333]/40", filter: "pending" },
    { label: "Issues",   value: data.filter(d => d.overall === "issues").length,   textCls: "text-[#2d4a36]", bgCls: "bg-[#ffd333]/40", borderCls: "border-[#ffd333]/60", filter: "issues" },
    { label: "Approved", value: data.filter(d => d.overall === "approved").length, textCls: "text-[#2d4a36]", bgCls: "bg-[#8fa797]/30", borderCls: "border-[#8fa797]/50", filter: "approved" },
    { label: "Rejected", value: data.filter(d => d.overall === "rejected").length, textCls: "text-[#2d4a36]", bgCls: "bg-[#f2a794]/30", borderCls: "border-[#f2a794]/50", filter: "rejected" },
  ];
 return (
    <div className="grid grid-cols-5 gap-3 px-6 py-4 border-b border-[#8fa797]/20 bg-white flex-shrink-0">
      {stats.map((s, i) => (
        <button key={i} onClick={() => onFilterClick(s.filter)}
          className={`rounded-xl p-3 border text-left hover:opacity-80 active:scale-95 transition-all ${s.bgCls} ${s.borderCls}`}>
          <p className={`text-2xl font-black ${s.textCls}`}>{s.value}</p>
          <p className="text-[10px] font-bold text-[#2d4a36]/60 mt-0.5">{s.label}</p>
        </button>
      ))}
    </div>
  );
};

export default StatsRow;