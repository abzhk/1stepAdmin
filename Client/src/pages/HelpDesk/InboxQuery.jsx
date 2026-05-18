import { useState } from "react";


const MESSAGES = [
  {
    id: 1, name: "Amara Johnson", email: "amara.j@gmail.com", phone: "(503) 555-0147",
    reason: "Scheduling an appointment", therapist: "Dr. Maya Patel, LCSW",
    msg: "Hi, I've been looking for a therapist who specializes in anxiety and trauma. A friend recommended your practice. I'd love to schedule an initial consultation to see if it might be a good fit. I'm available weekday afternoons. Thank you so much.",
    date: "Today, 10:42 AM", unread: true, tags: ["appointment", "new"], status: "new",
  },
  {
    id: 2, name: "Derek Lim", email: "derek.lim@outlook.com", phone: "",
    reason: "General inquiry", therapist: "",
    msg: "Hello, I'm wondering if any of your therapists offer sliding scale fees? I'm currently between jobs and could really use support but am worried about the cost. I don't want finances to be a barrier. Please let me know what options might be available.",
    date: "Today, 8:15 AM", unread: true, tags: ["general", "new"], status: "new",
  },
  {
    id: 3, name: "Priya Mehta", email: "p.mehta@email.com", phone: "(503) 555-0293",
    reason: "Insurance & billing", therapist: "Sarah Chen, PhD",
    msg: "I just started seeing Sarah Chen last month and I love working with her. I have a quick question about my recent invoice — it shows a different code than what I expected. Could someone from billing reach out to clarify? No rush, just want to make sure everything is filed correctly with my insurance.",
    date: "Yesterday, 3:30 PM", unread: false, tags: ["billing"], status: "read",
  },
  {
    id: 4, name: "Marcus Webb", email: "mwebb@protonmail.com", phone: "(971) 555-0041",
    reason: "Other", therapist: "",
    msg: "I'm going through a really difficult time right now. I've been having some dark thoughts and I'm not sure who else to turn to. I know this isn't a crisis line but I wanted to reach out. I've heard your practice is compassionate and discreet. Please call me as soon as possible.",
    date: "Yesterday, 11:00 AM", unread: true, tags: ["crisis", "new"], status: "new",
  },
  {
    id: 5, name: "Claire Thornton", email: "cthornton@work.com", phone: "",
    reason: "Referral from a provider", therapist: "James Okonkwo, LPC",
    msg: "Dr. Nguyen from Portland Family Medicine referred me to James Okonkwo. I'm looking to start therapy for depression management. I'd like to schedule a 15-minute intro call first if that's possible. My availability is flexible.",
    date: "Mon, Apr 14", unread: false, tags: ["appointment"], status: "replied",
  },
];


const TAG_STYLES = {
  new: "bg-[#ffd333]/30 text-[#2d4a36] border border-[#ffd333]/50", // Yellow
  crisis: "bg-[#f2a794]/20 text-[#2d4a36] font-bold border border-[#f2a794]/50", // Peach
  appointment: "bg-[#8fa797]/20 text-[#2d4a36] border border-[#8fa797]/30", // Sage
  billing: "bg-[#F6F4F0] text-[#2d4a36] border border-[#8fa797]/40", // Cream
  general: "bg-white text-[#2d4a36]/70 border border-[#8fa797]/20",
  replied: "bg-[#8fa797]/10 text-[#2d4a36]/60 border border-[#8fa797]/20",
};

const STATUS_DOT = {
  new: "bg-[#ffd333]", // Yellow
  read: "bg-[#8fa797]", // Sage
  replied: "bg-[#2d4a36]", // Dark Green
  archived: "bg-stone-300",
};


function Tag({ label }) {
  const cls = TAG_STYLES[label] || "bg-[#F6F4F0] text-[#2d4a36]/60 border border-[#8fa797]/20";
  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}


export default function AdminInbox() {
  const [msgs, setMsgs] = useState(MESSAGES);
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const filtered = msgs.filter((m) => {
    if (filter === "unread" && !m.unread) return false;
    if (filter === "appointment" && !m.tags.includes("appointment")) return false;
    if (filter === "crisis" && !m.tags.includes("crisis")) return false;
    const q = search.toLowerCase();
    if (q && !m.name.toLowerCase().includes(q) && !m.msg.toLowerCase().includes(q) && !m.reason.toLowerCase().includes(q)) return false;
    return true;
  });

  const active = msgs.find((m) => m.id === activeId);
  const unreadCount = msgs.filter((m) => m.unread).length;

  const openMsg = (id) => {
    setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
    setActiveId(id);
    setReplyOpen(false);
    setReplyText("");
  };

  const markStatus = (id, status) => {
    setMsgs((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status, unread: false, tags: status === "read" ? m.tags.filter((t) => t !== "new") : m.tags }
          : m
      )
    );
  };

  const sendReply = (id) => {
    setMsgs((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: "replied", tags: [...m.tags.filter((t) => t !== "new"), "replied"] }
          : m
      )
    );
    setReplyOpen(false);
    setReplyText("");
  };

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "appointment", label: "Appointments" },
    { key: "crisis", label: "Crisis flags" },
  ];

  return (
    <section className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-9xl flex flex-col min-h-[700px] bg-white rounded-3xl overflow-hidden  border border-[#8fa797]/30">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 bg-[#F6F4F0] border-b border-[#8fa797]/20 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-medium text-[#2d4a36]"> Inbox</h2>
            <p className="text-xs text-[#2d4a36]/60 mt-1 uppercase tracking-widest font-bold">Client Communications</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#2d4a36]/80 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#8fa797]/30 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f2a794] inline-block animate-pulse" />
              {unreadCount} unread
            </span>
            <span className="bg-[#2d4a36] text-[#F6F4F0] text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm">
              {msgs.length} total
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 px-8 py-4 bg-white border-b border-[#8fa797]/10 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                  filter === f.key
                    ? "bg-[#2d4a36] text-[#F6F4F0] border-[#2d4a36] shadow-md"
                    : "bg-[#F6F4F0] text-[#2d4a36]/70 border-[#8fa797]/30 hover:border-[#8fa797] hover:bg-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full md:w-64">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa797]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full text-sm pl-9 pr-4 py-2 rounded-full border border-[#8fa797]/40 bg-[#F6F4F0]/50 outline-none transition-all focus:bg-white focus:border-[#8fa797] focus:ring-4 focus:ring-[#8fa797]/20 text-[#2d4a36] placeholder:text-[#8fa797]"
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Message list */}
          <div className="w-full md:w-[360px] border-r border-[#8fa797]/20 overflow-y-auto bg-white flex-shrink-0 relative">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-[#8fa797] p-8 text-center font-medium">
                No messages match this filter.
              </div>
            ) : (
              filtered.map((m) => (
                <div
                  key={m.id}
                  onClick={() => openMsg(m.id)}
                  className={`relative px-6 py-5 border-b border-[#8fa797]/10 cursor-pointer transition-all duration-200 group ${
                    activeId === m.id 
                      ? "bg-[#F6F4F0] border-l-4 border-l-[#2d4a36]" 
                      : "hover:bg-[#F6F4F0]/50 border-l-4 border-l-transparent"
                  }`}
                >
                  {m.unread && (
                    <span className="absolute left-3 top-6 w-2 h-2 rounded-full bg-[#f2a794] shadow-[0_0_8px_rgba(242,167,148,0.8)]" />
                  )}
                  <div className="flex justify-between items-center mb-1 pl-2">
                    <span className={`text-sm font-bold ${m.unread ? "text-[#2d4a36]" : "text-[#2d4a36]/80"}`}>
                      {m.name}
                    </span>
                    <span className="text-[10px] font-bold text-[#8fa797] uppercase tracking-wider">{m.date}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#2d4a36]/60 pl-2 truncate mb-1">{m.reason || "No subject"}</div>
                  <div className="text-[11px] text-[#2d4a36]/50 pl-2 truncate mb-3 leading-relaxed">
                    {m.msg}
                  </div>
                  <div className="flex gap-1.5 pl-2 flex-wrap">
                    {m.tags.map((t) => <Tag key={t} label={t} />)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail pane */}
          <div className="flex-1 bg-[#F6F4F0] p-6 lg:p-10 overflow-y-auto relative">
            {!active ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-[#8fa797]/60">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#8fa797]/40 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium tracking-wide">Select a message to view details</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Detail Header */}
                <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
                  <div>
                    <h3 className="font-serif text-3xl font-medium text-[#2d4a36]">{active.name}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-[#8fa797] uppercase tracking-wider">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block shadow-sm ${STATUS_DOT[active.status] || "bg-[#8fa797]"}`} />
                      {active.date} <span className="text-[#8fa797]/40">•</span> {active.reason}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {active.tags.map((t) => <Tag key={t} label={t} />)}
                  </div>
                </div>

                {/* Client Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    ["Email", active.email, "text-[#2d4a36] font-semibold"],
                    ["Phone", active.phone || "—", "text-[#2d4a36] font-semibold"],
                    ["Topic", active.reason, "text-[#2d4a36]"],
                    ["Preferred Therapist", active.therapist || "No preference", "text-[#8fa797] font-medium italic"],
                  ].map(([lbl, val, valCls]) => (
                    <div key={lbl} className="bg-white rounded-2xl px-5 py-4 border border-[#8fa797]/15 shadow-sm">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fa797] mb-1.5">{lbl}</div>
                      <div className={`text-sm ${valCls}`}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Message Body */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 text-sm text-[#2d4a36]/80 leading-relaxed mb-6 border-l-4 border-[#8fa797] shadow-sm relative overflow-hidden">
                  {/* Decorative subtle shape */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6F4F0] rounded-bl-[100px] -z-0 opacity-50"></div>
                  <p className="relative z-10 whitespace-pre-wrap">{active.msg}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setReplyOpen((v) => !v)}
                    className="px-5 py-2.5 bg-[#2d4a36] hover:bg-[#8fa797] text-[#F6F4F0] text-sm font-bold tracking-wide rounded-xl shadow-lg shadow-[#2d4a36]/20 transition-all active:scale-[0.98]"
                  >
                    ↩ Reply to Client
                  </button>
                  <button
                    onClick={() => markStatus(active.id, "read")}
                    className="px-5 py-2.5 bg-white border border-[#8fa797]/40 text-sm font-bold text-[#2d4a36] rounded-xl hover:bg-[#8fa797]/10 transition-all shadow-sm"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => markStatus(active.id, "archived")}
                    className="px-5 py-2.5 bg-white border border-[#8fa797]/40 text-sm font-bold text-[#2d4a36]/70 rounded-xl hover:bg-[#8fa797]/10 transition-all shadow-sm"
                  >
                    Archive
                  </button>
                  {active.tags.includes("crisis") && (
                    <button className="px-5 py-2.5 bg-[#f2a794]/10 border border-[#f2a794] text-sm font-bold text-[#f2a794] rounded-xl hover:bg-[#f2a794]/20 transition-all ml-auto shadow-sm">
                      🚨 Flag for Follow-up
                    </button>
                  )}
                </div>

                {/* Reply Box */}
                {replyOpen && (
                  <div className="mt-8 pt-8 border-t border-[#8fa797]/20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8fa797] mb-3">
                      Drafting reply to <strong className="text-[#2d4a36]">{active.name}</strong> ({active.email})
                    </p>
                    <textarea
                      className="w-full px-5 py-4 border border-[#8fa797]/40 bg-white rounded-2xl text-sm text-[#2d4a36] outline-none focus:border-[#2d4a36] focus:ring-4 focus:ring-[#8fa797]/20 resize-y min-h-[140px] leading-relaxed shadow-sm transition-all"
                      placeholder="Type your compassionate response here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setReplyOpen(false)}
                        className="px-5 py-2.5 bg-white border border-[#8fa797]/40 text-sm font-bold text-[#2d4a36] rounded-xl hover:bg-[#8fa797]/10 transition-all shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => sendReply(active.id)}
                        className="px-6 py-2.5 bg-[#2d4a36] hover:bg-[#8fa797] text-[#F6F4F0] text-sm font-bold tracking-wide rounded-xl shadow-lg shadow-[#2d4a36]/20 transition-all active:scale-[0.98]"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}





