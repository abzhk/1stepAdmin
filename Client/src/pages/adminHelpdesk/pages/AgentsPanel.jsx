import { Av } from "../Shared/SharedUI";
import { AGENTS, AGENT_COLOR_MAP } from "../data/mockData";


//UI designed By Gokul
export default function AgentsPanel() {
  const max = Math.max(...AGENTS.map(a => a.resolved));
  return (
    <div className="grid grid-cols-2 gap-5 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5">
        {AGENTS.map(a => (
          <div key={a.name} className="bg-white rounded-[20px] border border-[#8fa797]/20 shadow-[0_4px_20px_rgba(45,74,54,0.02)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(45,74,54,0.06)]">
            <div className="p-6 flex items-center gap-5">
              <Av initials={a.initials} cc={AGENT_COLOR_MAP[a.color]} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <span className="text-[16px] font-bold text-[#2d4a36]">{a.name}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${a.status === "online" ? "bg-[#8fa797]/10 text-[#2d4a36] border-[#8fa797]/40" : a.status === "away" ? "bg-[#ffd333]/10 text-[#2d4a36] border-[#ffd333]/40" : "bg-[#F6F4F0] text-[#8fa797] border-[#8fa797]/20"}`}>
                    {a.status === "online" ? "● Online" : a.status === "away" ? "● Away" : "● Offline"}
                  </span>
                </div>
                <div className="text-[12px] font-medium text-[#8fa797]">{a.role}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-[#8fa797]/10 bg-[#F6F4F0]/30 divide-x divide-[#8fa797]/10">
              {[{ l: "Open", v: a.open, c: "text-[#ffd333]" }, { l: "Resolved", v: a.resolved, c: "text-[#2d4a36]" }, { l: "Avg time", v: `${(1.8 + a.open * 0.3).toFixed(1)}h`, c: "text-[#8fa797]" }].map(s => (
                <div key={s.l} className="px-6 py-4">
                  <div className="text-[10px] font-bold text-[#8fa797]/80 uppercase tracking-widest mb-1">{s.l}</div>
                  <div className={`text-[22px] font-black ${s.c} leading-none`}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col gap-5">
        <div className="bg-[#2d4a36] rounded-[20px] p-8 text-[#F6F4F0] shadow-xl shadow-[#2d4a36]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ffd333" strokeWidth="1.5"><path d="M12 15l-2 5l9-9l-9-9l2 5l-9 9l9 9z" /></svg>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#8fa797] mb-3">Star Performer 🏆</div>
          <div className="flex items-center gap-4 relative z-10">
            <Av initials="DL" cc="bg-[#ffd333] text-[#2d4a36]" size="lg" />
            <div>
              <div className="text-[20px] font-black">Divya Lakshmi</div>
              <div className="text-[13px] font-medium text-[#F6F4F0]/80">31 tickets resolved this week</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[#8fa797]/20 shadow-[0_4px_20px_rgba(45,74,54,0.02)] p-6">
          <h2 className="text-[14px] font-bold text-[#2d4a36] mb-6 tracking-tight">Team at a Glance</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { l: "Total open", v: AGENTS.reduce((s, a) => s + a.open, 0), c: "text-[#ffd333]" }, 
              { l: "Total resolved", v: AGENTS.reduce((s, a) => s + a.resolved, 0), c: "text-[#2d4a36]" }, 
              { l: "Online now", v: AGENTS.filter(a => a.status === "online").length, c: "text-[#8fa797]" }, 
              { l: "Avg resolved", v: Math.round(AGENTS.reduce((s, a) => s + a.resolved, 0) / AGENTS.length), c: "text-[#f2a794]" }
            ].map(s => (
              <div key={s.l} className="bg-[#F6F4F0]/50 border border-[#8fa797]/10 rounded-2xl p-5">
                <div className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest mb-2">{s.l}</div>
                <div className={`text-[28px] font-black ${s.c} leading-none`}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}