import { Av, PriorityBadge, StatusBadge } from "../Shared/SharedUI";
import { AGENTS, AGENT_COLOR_MAP, ac } from "../data/mockData";


//UI designed By Gokul
export default function DashboardPanel({ tickets,  stats, onViewAll, onTicketClick }) {
  const open = tickets.filter(t => t.status === "Open").length;
  const inP = tickets.filter(t => t.status === "In progress").length;
  const res = tickets.filter(t => t.status === "Resolved").length;
  const high = tickets.filter(t => t.priority === "High").length;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Open", val: open, color: "text-darkgreen", dot: "bg-darkgreen",  },
          { label: "In Progress", val: inP, color: "text-yellow", dot: "bg-yellow",  },
          { label: "Resolved", val: res, color: "text-[#2d4a36]", dot: "bg-[#2d4a36]",  },
          { label: "High Priority", val: high, color: "text-softpeach", dot: "bg-softpeach", },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-[20px] border border-[#8fa797]/20 p-5 shadow-[0_4px_20px_rgba(45,74,54,0.02)] hover:shadow-[0_8px_30px_rgba(45,74,54,0.06)] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest">{s.label}</span>
              <div className={`w-2 h-2 rounded-full ${s.dot}`} />
            </div>
            <div className={`text-[32px] font-black tracking-tight ${s.color} leading-none mb-1`}>{s.val}</div>
            {/* <div className="text-[11px] font-medium text-[#8fa797]">{s.sub}</div> */}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="col-span-2 bg-white rounded-[20px] border border-[#8fa797]/20 shadow-[0_4px_20px_rgba(45,74,54,0.02)] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#8fa797]/10 flex items-center justify-between bg-[#F6F4F0]/30">
            <h2 className="text-[14px] font-bold text-[#2d4a36] tracking-tight">Recent Tickets</h2>
            <button onClick={onViewAll} className="text-[11px] font-bold text-[#8fa797] hover:text-[#2d4a36] border border-[#8fa797]/30 rounded-full px-4 py-1.5 transition-colors bg-white shadow-sm">View all →</button>
          </div>
          <table className="w-full flex-1">
            <thead>
              <tr className="bg-[#F6F4F0]/50 border-b border-[#8fa797]/10">
                {["ID", "User", "Issue", "Priority", "Status"].map(h => <th key={h} className="text-left text-[10px] font-bold text-[#8fa797] uppercase tracking-widest px-6 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tickets.slice(0, 6).map((t, i) => (
                <tr key={t._id} onClick={() => onTicketClick(t, i)} className="border-b border-[#8fa797]/5 hover:bg-[#F6F4F0]/50 transition-colors cursor-pointer last:border-0">
                  <td className="px-6 py-4 text-[11px] text-label">{t.ticketId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                    <Av
  image={t.user?.profilePicture}
  initials={t.user?.username?.charAt(0) || "G"}
  cc={ac(i)}
  size="sm"
/>

<span className="text-[13px] text-label">
  {t.user?.username}
</span>
                      {/* <span className="text-[13px] font-bold text-[#2d4a36]">{t.user.username ? t.user.username.split(" ")[0] : t.user}</span> */}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[180px]"><span className="text-[13px] font-medium text-[#2d4a36]/80 truncate block">{t.title}</span></td>
                  <td className="px-6 py-4 text-label"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-6 py-4 text-label"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
{/* agent (feature in progress)         */}

        <div className="flex flex-col gap-5">
          {/* <div className="bg-white rounded-[20px] border border-[#8fa797]/20 shadow-[0_4px_20px_rgba(45,74,54,0.02)] p-6">
            <h2 className="text-[14px] font-bold text-[#2d4a36] mb-5 tracking-tight">Agent Workload</h2>
            <div className="flex flex-col gap-4">
              {AGENTS.map(a => (
                <div key={a.name} className="flex items-center gap-3">
                  <Av initials={a.initials} cc={AGENT_COLOR_MAP[a.color]} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-[#2d4a36] truncate">{a.name.split(" ")[0]}</div>
                    <div className="text-[11px] font-medium text-[#8fa797]">{a.open} open · {a.resolved} done</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${a.status === "online" ? "bg-[#8fa797]" : a.status === "away" ? "bg-[#ffd333]" : "bg-[#F6F4F0] border border-[#8fa797]/30"}`} />
                </div>
              ))}
            </div>
          </div> */}

{/* removed flex-1 from table to fix height issue   */}
          {/* <div className="bg-[#2d4a36] rounded-[20px] p-6 text-[#F6F4F0] shadow-lg shadow-[#2d4a36]/20 relative overflow-hidden  flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8fa797] mb-2">Weekly Target SLA</div>
            <div className="text-[36px] font-black text-[#ffd333] leading-none mb-1">94%</div>
            <div className="text-[12px] font-medium text-[#F6F4F0]/70 mb-5">Response within 4 hours</div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#ffd333] rounded-full" style={{ width: "94%" }} />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}