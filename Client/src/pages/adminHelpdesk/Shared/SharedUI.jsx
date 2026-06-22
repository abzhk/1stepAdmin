//UI designed By Gokul


export function StatusBadge({ status }) {
  const cfg = { 
    "Open": "bg-white text-[#2d4a36] border border-[#8fa797]/40", 
    "In progress": "bg-[#ffd333]/20 text-[#2d4a36] border border-[#ffd333]/40", 
    "Resolved": "bg-[#8fa797]/20 text-[#2d4a36] border border-[#8fa797]/40", 
    "Closed": "bg-[#F6F4F0] text-[#2d4a36]/50 border border-[#8fa797]/20" 
  };
  const dot = { 
    "Open": "bg-[#8fa797]", 
    "In progress": "bg-[#ffd333]", 
    "Resolved": "bg-[#2d4a36]", 
    "Closed": "bg-[#8fa797]/30" 
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg[status] || cfg.Open}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[status] || dot.Open}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = { 
    "High": "bg-[#f2a794]/20 text-[#2d4a36] border border-[#f2a794]/40", 
    "Medium": "bg-[#ffd333]/20 text-[#2d4a36] border border-[#ffd333]/40", 
    "Low": "bg-[#8fa797]/15 text-[#2d4a36] border border-[#8fa797]/30" 
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg[priority] || cfg.Low}`}>
      {priority}
    </span>
  );
}

export function Av({ image, initials, cc, size = "sm" }) {
  const sz = {
    xs: "w-6 h-6 text-[9px]",
    sm: "w-8 h-8 text-[11px]",
    md: "w-10 h-10 text-[13px]",
    lg: "w-12 h-12 text-[14px]",
  };

  if (image) {
    return (
      <img
        src={image}
        alt={initials}
        className={`${sz[size]} rounded-full object-cover flex-shrink-0 shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sz[size]} rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-sm ${cc}`}
    >
      {initials}
    </div>
  );
}