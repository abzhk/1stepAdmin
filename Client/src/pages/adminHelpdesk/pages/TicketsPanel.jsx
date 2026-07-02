import { useState } from "react";
import { Av, PriorityBadge, StatusBadge } from "../Shared/SharedUI";
import {  ac } from "../data/mockData";
import formatdatateUtils from "../../../utils/dateFormatUtils.js";


//UI designed By Gokul
export default function TicketsPanel({ tickets,search,
  setSearch, page,
  setPage,
  pagination,onTicketClick, onUpdateTicket }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(new Set());

 const filtered = tickets.filter(
  t => filter === "All" || t.status === filter
);

  const toggle = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulkClose = () => { selected.forEach(id => { const t = tickets.find(t => t._id === id); if (t) onUpdateTicket({ ...t, status: "Closed" }); }); setSelected(new Set()); };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-white rounded-[20px] border border-[#8fa797]/20 shadow-[0_4px_20px_rgba(45,74,54,0.02)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#8fa797]/10 flex items-center gap-4 flex-wrap bg-[#F6F4F0]/30">
          <h2 className="text-[16px] font-bold text-[#2d4a36] mr-auto tracking-tight">All Tickets</h2>
          
          {/* {selected.size > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[12px] font-bold text-[#8fa797]">{selected.size} selected</span>
              <button onClick={bulkClose} className="text-[11px] font-bold px-4 py-2 bg-[#f2a794]/20 text-[#2d4a36] rounded-full border border-[#f2a794]/40 hover:bg-[#f2a794]/30 transition-colors">Mark Closed</button>
              <button onClick={() => setSelected(new Set())} className="text-[11px] font-bold text-[#8fa797] hover:text-[#2d4a36] transition-colors">Clear</button>
            </div>
          )} */}
          
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8fa797]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4" /><path d="M11 11l2.5 2.5" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" className="pl-10 pr-4 py-2 text-[12px] font-medium border border-[#8fa797]/30 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#8fa797]/40 text-[#2d4a36] placeholder-[#8fa797]/60 w-64 shadow-sm transition-all" />
          </div>
        </div>
        
        <div className="flex gap-2 px-6 py-3 border-b border-[#8fa797]/10 bg-white">
          {["All", "Open", "In progress", "Resolved", ].map(f => {
            const cnt = f === "All" ? tickets.length : tickets.filter(t => t.status === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)} className={`text-[12px] px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-2 border ${filter === f ? "bg-[#2d4a36] text-[#F6F4F0] border-[#2d4a36] shadow-md" : "bg-[#F6F4F0]/50 text-[#8fa797] border-[#8fa797]/20 hover:border-[#8fa797]/40 hover:text-[#2d4a36]"}`}>
                {f}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${filter === f ? "bg-white/20 text-[#F6F4F0]" : "bg-white text-[#8fa797] shadow-sm"}`}>{cnt}</span>
              </button>
            );
          })}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-offwhite border-b border-[#8fa797]/10">
                <th className="px-6 py-4 w-12"></th>
                {["ID", "User", "Issue", "Category", "Priority", "Status",
                  //  "Agent", 
                   "Created"].map(h => <th key={h} className="text-left text-[10px] font-bold text-[#8fa797] uppercase tracking-widest px-4 py-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} className="text-center py-20 text-[13px] font-bold text-[#8fa797]">No tickets found.</td></tr>
                : filtered.map((t, i) => {
                 
                  return (
                    <tr key={t._id}   onClick={() => onTicketClick(t, i)} className={`border-b border-[#8fa797]/5 hover:bg-[#F6F4F0]/60 transition-colors cursor-pointer last:border-0 ${selected.has(t._id) ? "bg-[#ffd333]/5" : ""}`}>
                      <td className="px-6 py-4" onClick={e => { e.stopPropagation(); toggle(t._id); }}></td>
                      <td className="px-4 py-4  text-[11px] text-label">{t.ticketId}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Av initials={t.email?.charAt(0).toUpperCase()} cc={ac(i)} size="sm"/>
                          <div>
                            <div className="text-[12px] font-bold text-[#2d4a36] whitespace-nowrap">{t.user?.username}</div>
                            <div className="text-[10px] font-medium text-[#8fa797]">{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <div className="text-[13px] font-medium text-[#2d4a36] truncate block">{t.title}</div>
                        {t.messages > 0 && <div className="text-[10px]  text-label">{t.messages} message{t.messages !== 1 ? "s" : ""}</div>}
                      </td>
                      <td className="px-4 py-4 text-[12px] font-bold text-label">{t.category}</td>
                       {/* <td className="px-4 py-4 text-[12px] font-bold text-label">{t.user?.role}</td> */}
                      <td className="px-4 py-4"><PriorityBadge priority={t.priority} /></td>
                      <td className="px-4 py-4"><StatusBadge status={t.status} /></td>
                      {/* <td className="px-4 py-4">
                        {t.agent ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#F6F4F0] border border-[#8fa797]/30 flex items-center justify-center text-[9px] font-bold text-[#2d4a36]">
                              {t.agent.split(" ").map(w => w[0]).join("").slice(0, 2)}
                            </div>
                            <span className="text-[12px] font-bold text-[#2d4a36]/80">{t.agent.split(" ")[0]}</span>
                          </div>
                        ) : <span className="text-[11px] font-medium text-[#8fa797] italic">Unassigned</span>}
                      </td> */}
                      <td className="px-4 py-4 text-[11px]  text-label whitespace-nowrap">{formatdatateUtils(t.createdAt)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
  <button
    disabled={!pagination?.hasPrevPage}
    onClick={() => setPage((prev) => prev - 1)}
    className="px-4 py-2 bg-[#2d4a36] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Prev
  </button>

  <span className="px-4 py-2 bg-[#F6F4F0] text-[#2d4a36] mx-2">
    {pagination?.page || 1} of {pagination?.totalPages || 1}
  </span>

  <button
    disabled={!pagination?.hasNextPage}
    onClick={() => setPage((prev) => prev + 1)}
    className="px-4 py-2 bg-[#2d4a36] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Next
  </button>
</div>
    </div>
  );
}