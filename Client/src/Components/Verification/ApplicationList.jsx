import React from 'react'
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ApplicationList = ({applicants,selectedId,onSelect,filter,setFilter,sortBy,setSortBy,search,setSearch}
) => {


  const FILTERS = ["all", "pending", "issues", "approved", "rejected"];

const counts = FILTERS.reduce((acc, f) => {
  acc[f] =
    f === "all"
      ? applicants.length
      : applicants.filter(a => a.overall === f).length;
  return acc;
}, {});

const filtered = applicants.filter(a => {
  if (filter !== "all" && a.overall !== filter) return false;

  if (search.trim()) {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  }

  return true;
});
  return (
    <div>

 <div className="flex flex-col h-full bg-white">
      <div className="px-4 pt-5 pb-3 border-b border-[#8fa797]/20">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-sm font-bold text-[#2d4a36]">Claim Requests</h1>
          <span className="text-xs font-bold bg-[#8fa797]/20 text-[#2d4a36] px-2 py-0.5 rounded-full">{applicants.length}</span>
        </div>
        <div className="relative mb-2">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8fa797]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-2 text-xs font-medium rounded-lg border border-[#8fa797]/30 bg-[#F6F4F0]/50 text-[#2d4a36] placeholder:text-[#8fa797]/80 focus:outline-none focus:ring-2 focus:ring-[#8fa797]/50"
            placeholder="Name, role, city, email…" />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8fa797] hover:text-[#2d4a36] transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs font-bold border border-[#8fa797]/30 rounded-lg bg-white text-[#2d4a36]/70 focus:outline-none focus:ring-2 focus:ring-[#8fa797]/50">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">By priority</option>
        </select>
      </div>

      <div className="px-3 py-2 border-b border-[#8fa797]/20 flex gap-1.5 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition
              ${filter === f ? "bg-[#2d4a36] text-[#F6F4F0]" : "bg-[#F6F4F0] text-[#2d4a36]/70 hover:bg-[#8fa797]/20"}`}>
            {f} <span className="opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs font-medium text-[#8fa797]/70">No results</div>
        ) : filtered.map(a => (
          <button key={a.id} onClick={() => onSelect(a.id)}
            className={`w-full text-left px-4 py-3.5 border-b border-[#8fa797]/15 hover:bg-[#F6F4F0]/50 transition
              ${selectedId === a.id
                ? "bg-[#8fa797]/10 border-l-2 border-l-[#2d4a36]"
                : "border-l-2 border-l-transparent"}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${a.color}`}>
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-xs font-bold text-[#2d4a36] truncate">{a.name}</p>
                  {/* <PriorityBadge priority={a.priority} /> */}
                </div>
                <p className="text-[10px] font-medium text-[#2d4a36]/60 truncate">{a.role} </p>
                <div className="flex items-center justify-between mt-1.5">
                  <StatusBadge status={a.overall} small />
                  <span className="text-[9px] font-medium text-[#8fa797]">{timeAgo(a.submittedTs)}</span>
                </div>
                {a.notes.length > 0 && (
                  <p className="text-[9px] font-bold text-[#ffd333] drop-shadow-sm mt-1">📝 {a.notes.length} note{a.notes.length > 1 ? "s" : ""}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>

    </div>
  )
}

export default ApplicationList