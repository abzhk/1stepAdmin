import { AGENTS } from "../data/mockData";


//UI designed By Gokul
export default function ReportsPanel({ tickets }) {
  const byStatus = ["Open", "In progress", "Resolved", "Closed"].map(s => ({ s, n: tickets.filter(t => t.status === s).length }));
  const byCat = ["Billing", "Technical", "Booking", "Account", "General"].map(c => ({ c, n: tickets.filter(t => t.cat === c).length }));
  const max = Math.max(...byStatus.map(x => x.n), 1);
  const statusColors = { "Open": "#8fa797", "In progress": "#ffd333", "Resolved": "#2d4a36", "Closed": "#E2DFD6" };

  return (
    <div className="grid grid-cols-2 gap-5 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5">
        <div className="bg-white rounded-[20px] border border-[#8fa797]/20 shadow-[0_4px_20px_rgba(45,74,54,0.02)] p-7">
          <h2 className="text-[15px] font-bold text-[#2d4a36] mb-6 tracking-tight">Tickets by Status</h2>
          <div className="flex flex-col gap-5">
            {byStatus.map(x => (
              <div key={x.s}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-bold text-[#2d4a36]">{x.s}</span>
                  <span className="text-[13px] font-black text-[#8fa797]">{x.n}</span>
                </div>
                <div className="h-3 bg-[#F6F4F0] rounded-full overflow-hidden border border-[#8fa797]/10">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${(x.n / max) * 100}%`, background: statusColors[x.s] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[20px] border border-[#8fa797]/20 shadow-[0_4px_20px_rgba(45,74,54,0.02)] p-7">
          <h2 className="text-[15px] font-bold text-[#2d4a36] mb-6 tracking-tight">Tickets by Priority</h2>
          <div className="flex gap-4">
            {["High", "Medium", "Low"].map(p => (
              <div key={p} className={`flex-1 text-center py-5 rounded-2xl border ${p === "High" ? "bg-[#f2a794]/10 border-[#f2a794]/20" : p === "Medium" ? "bg-[#ffd333]/10 border-[#ffd333]/20" : "bg-[#8fa797]/10 border-[#8fa797]/20"}`}>
                <div className={`text-[32px] font-black mb-2 ${p === "High" ? "text-[#f2a794]" : p === "Medium" ? "text-[#ffd333]" : "text-[#8fa797]"}`}>
                  {tickets.filter(t => t.priority === p).length}
                </div>
                <div className="text-[11px] font-bold text-[#2d4a36]/60 uppercase tracking-widest">{p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-5">
        <div className="bg-[#2d4a36] rounded-[20px] shadow-xl p-7 text-[#F6F4F0]">
          <h2 className="text-[15px] font-bold text-[#F6F4F0] mb-6 tracking-tight">Overall Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { l: "Total requests", v: tickets.length, c: "text-white" },
              { l: "Resolution rate", v: `${Math.round((tickets.filter(t => ["Resolved", "Closed"].includes(t.status)).length / tickets.length) * 100)}%`, c: "text-[#ffd333]" },
              { l: "Unassigned", v: tickets.filter(t => !t.agent).length, c: "text-[#f2a794]" },
              { l: "Avg per agent", v: Math.round(tickets.length / AGENTS.length), c: "text-[#8fa797]" },
            ].map(s => (
              <div key={s.l} className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                <div className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest mb-2">{s.l}</div>
                <div className={`text-[28px] font-black ${s.c} leading-none`}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[#8fa797]/20 shadow-[0_4px_20px_rgba(45,74,54,0.02)] p-7">
          <h2 className="text-[15px] font-bold text-[#2d4a36] mb-6 tracking-tight">Volume by Category</h2>
          <div className="flex flex-col gap-4">
            {byCat.map(x => (
              <div key={x.c} className="flex items-center gap-4">
                <div className="text-[12px] font-bold text-[#8fa797] w-20 flex-shrink-0">{x.c}</div>
                <div className="flex-1 h-2.5 bg-[#F6F4F0] rounded-full overflow-hidden border border-[#8fa797]/10">
                  <div className="h-full bg-[#2d4a36] rounded-full" style={{ width: `${(x.n / tickets.length) * 100}%` }} />
                </div>
                <div className="text-[13px] font-black text-[#2d4a36] w-6 text-right">{x.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}