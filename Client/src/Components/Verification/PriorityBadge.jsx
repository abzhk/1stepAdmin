import React from "react";

const priorityCfg = {
  high:   { label: "High",   bg: "bg-[#f2a794]/20", text: "text-[#2d4a36]", border: "border-[#f2a794]/50" },
  medium: { label: "Medium", bg: "bg-[#ffd333]/20", text: "text-[#2d4a36]", border: "border-[#ffd333]/50" },
  low:    { label: "Low",    bg: "bg-[#F6F4F0]", text: "text-[#8fa797]", border: "border-[#8fa797]/30" },
};

const PriorityBadge = ({ priority, onClick }) => {
  const c = priorityCfg[priority] || priorityCfg.low;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border
        ${c.bg} ${c.text} ${c.border} ${
        onClick ? "cursor-pointer hover:opacity-80" : ""
      }`}
    >
      {c.label}
    </span>
  );
};

export default PriorityBadge;