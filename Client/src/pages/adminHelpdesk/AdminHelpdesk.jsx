import { useState } from "react";
import { INITIAL_TICKETS } from "./data/mockData";
import { StatusBadge } from "./Shared/SharedUI";
import DashboardPanel from "./pages/DashboardPanel";
import TicketsPanel from "./pages/TicketsPanel";
import AgentsPanel from "./pages/AgentsPanel";
import ReportsPanel from "./pages/ReportsPanel";
import TicketDrawer from "./pages/TicketDrawer";
import NewTicketModal from "./pages/NewTicketModal";
import { api } from "../../utils/api.js";
import { useEffect } from "react";

//UI designed By Gokul
export default function AdminHelpdesk() {
  const [panel, setPanel] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [loading,setLoading]=useState();
  const [error,setError] =useState();
  const [drawer, setDrawer] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
const [pagination, setPagination] = useState({});
const [stats, setStats] = useState({
  open: 0,
  inProgress: 0,
  resolved: 0,
  highPriority: 0,
});
const [filter, setFilter] = useState("All");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const updateTicket = async (ticketId, payload) => {
  console.log("Ticket ID:", ticketId);
  console.log("Payload:", payload);

  try {
    const data = await api(
      `/api/help/update-ticket/${ticketId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    console.log("Update Response:", data);

    setTickets(prev =>
      prev.map(t =>
        t._id === ticketId ? data.ticket : t
      )
    );
  } catch (error) {
    console.error(error);
  }
};
  const addTicket = (t) => { setTickets(prev => [t, ...prev]); showToast(`${t.id} created!`); };

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1.5" /><rect x="9" y="1" width="6" height="6" rx="1.5" /><rect x="1" y="9" width="6" height="6" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx="1.5" /></svg> },
    { id: "tickets", label: "Tickets",  badge: stats.open, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M5 6h6M5 9h4" /></svg> },
    // { id: "agents", label: "Agents", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16"><circle cx="8" cy="5" r="2.5" /><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" /></svg> },
    // { id: "reports", label: "Reports", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16"><path d="M2 12V8M6 12V5M10 12V7M14 12V3" /></svg> },
  ];

  const TITLES = { dashboard: "Dashboard Overview", tickets: "Support Tickets", agents: "Support Agents", reports: "Analytics & Reports" };

const fetchTickets = async () => {
  try {
    setLoading(true);

    const data = await api(
  `/api/help/all-tickets?search=${search}&status=${filter}&page=${page}&limit=10`
);
// console.log(data.pagination);
    setTickets(data.tickets);
     setPagination(data.pagination);
     setStats(data.stats);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTickets();
}, [search,filter,page]);

  return (
    <div className="flex h-screen bg-[#F6F4F0] overflow-hidden text-[#2d4a36] selection:bg-greenmuted rounded-t-2xl" >
      <aside className="w-64 flex-shrink-0 bg-white backdrop-blur-xl border-r border-[#8fa797]/20 flex flex-col z-10 shadow-[4px_0_24px_rgba(45,74,54,0.02)]">
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="text-[10px] font-bold text-greenmuted uppercase tracking-widest px-3 mb-3">Menu</div>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPanel(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] mb-1.5 transition-all font-bold ${panel === item.id ? "bg-[#2d4a36] text-[#F6F4F0] shadow-md shadow-[#2d4a36]/10" : "text-[#8fa797] hover:bg-[#8fa797]/10 hover:text-[#2d4a36]"}`}>
              <span className={panel === item.id ? "opacity-100" : "opacity-60"}>{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${panel === item.id ? "bg-[#ffd333] text-[#2d4a36]" : "bg-[#f2a794]/20 text-[#2d4a36] border border-[#f2a794]/30"}`}>{item.badge}</span>}
            </button>
          ))}
          
          <div className="text-[10px] font-bold text-[#8fa797]/70 uppercase tracking-widest px-3 mb-3 mt-8">Recent Tickets</div>
          {tickets.slice(0, 4).map((t, i) => (
            <button key={t._id} onClick={() => { setPanel("tickets"); setDrawer({ ticket: t, idx: i }); }} className="w-full text-left px-4 py-3 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-[#8fa797]/20 transition-all mb-1.5 group">
              <div className="font-mono text-[10px] font-bold text-[#8fa797] mb-1">{t.ticketId}</div>
              <div className="text-[12px] font-bold text-[#2d4a36]/80 truncate group-hover:text-[#2d4a36]">{t.title}</div>
              <div className="mt-2"><StatusBadge status={t.status} /></div>
            </button>
          ))}
        </nav>
        
        {/* <div className="px-5 py-5 border-t border-[#8fa797]/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#F6F4F0]/80 border border-[#8fa797]/20">
            <div className="w-8 h-8 rounded-full bg-[#f2a794]/20 border border-[#f2a794]/40 text-[#2d4a36] flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-sm">AD</div>
            <div className="min-w-0"><div className="text-[12px] font-bold text-[#2d4a36]">Admin User</div><div className="text-[10px] font-medium text-[#8fa797]">Workspace Owner</div></div>
          </div>
        </div> */}
      </aside>

  
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-[76px] bg-white backdrop-blur-xl border-b border-[#8fa797]/20 flex items-center px-8 gap-4 flex-shrink-0 z-10">
          <h1 className="text-[20px] font-black text-[#2d4a36] flex-1 tracking-tight">{TITLES[panel]}</h1>
         
        </header>
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          {panel === "dashboard" && <DashboardPanel tickets={tickets}  stats={stats} onViewAll={() => setPanel("tickets")} onTicketClick={(t, i) => setDrawer({ ticket: t, idx: i })} />}
          {panel === "tickets" && <TicketsPanel tickets={tickets}  search={search} page={page}  filter={filter}
  setFilter={setFilter}
  setPage={setPage}
  pagination={pagination}
  setSearch={setSearch} onTicketClick={(t, i) => setDrawer({ ticket: t, idx: i })} onUpdateTicket={updateTicket} />}
          {/* {panel === "agents" && <AgentsPanel />} */}
          {panel === "reports" && <ReportsPanel tickets={tickets} />}
        </main>
      </div>

     
      {drawer && (
        <div className="animate-in slide-in-from-right duration-300">
          <TicketDrawer
            ticket={drawer.ticket}
            idx={drawer.idx}
            onClose={() => setDrawer(null)}
            onUpdate={async (ticketId, payload) => {
  await updateTicket(ticketId, payload);
  setDrawer(null);
}}
          />
        </div>
      )}

     
      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onSubmit={addTicket} />}

   
      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#2d4a36] text-[#F6F4F0] text-[13px] font-bold px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgba(45,74,54,0.3)] flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-5 h-5 rounded-full bg-[#ffd333] flex items-center justify-center text-[#2d4a36]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 16 16"><path d="M3 8l3.5 3.5L13 4" /></svg>
          </div>
          {toast}
        </div>
      )}
    </div>
  );
}