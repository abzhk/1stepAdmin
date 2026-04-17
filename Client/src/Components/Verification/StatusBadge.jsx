import React from "react";

const statusCfg = {
  verified: { label: "Verified", bg: "bg-[#8fa797]/20", text: "text-[#2d4a36]", border: "border-[#8fa797]/50", dot: "bg-[#8fa797]" },
  pending:  { label: "Submitted",  bg: "bg-[#ffd333]/20", text: "text-[#2d4a36]", border: "border-[#ffd333]/50", dot: "bg-[#ffd333]" },
  failed:   { label: "Failed",   bg: "bg-[#f2a794]/20", text: "text-[#2d4a36]", border: "border-[#f2a794]/50", dot: "bg-[#f2a794]" },
  missing:  { label: "Missing",  bg: "bg-[#F6F4F0]", text: "text-[#8fa797]", border: "border-[#8fa797]/30", dot: "bg-[#8fa797]/50" },
  uploaded: { label: "Uploaded", bg: "bg-[#8fa797]/10", text: "text-[#2d4a36]", border: "border-[#8fa797]/30", dot: "bg-[#8fa797]" },
  approved: { label: "Approved", bg: "bg-[#8fa797]/20", text: "text-[#2d4a36]", border: "border-[#8fa797]/50", dot: "bg-[#8fa797]" },
  issues:   { label: "Issues",   bg: "bg-[#ffd333]/30", text: "text-[#2d4a36]", border: "border-[#ffd333]/60", dot: "bg-[#ffd333]" },
  rejected: { label: "Rejected", bg: "bg-[#f2a794]/30", text: "text-[#2d4a36]", border: "border-[#f2a794]/60", dot: "bg-[#f2a794]" },
};

const StatusBadge = ({ status, small }) => {
  const c = statusCfg[status] || statusCfg.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium
      ${small ? "text-[10px]" : "text-xs"} ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export default StatusBadge;