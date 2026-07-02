import { useState } from "react";
import { Av, StatusBadge, PriorityBadge } from "../Shared/SharedUI";
import { AGENTS, ac } from "../data/mockData";
import {api} from "../../../utils/api.js";

//UI designed By Gokul
export default function TicketDrawer({ ticket, idx, onClose, onUpdate }) {
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [agent, setAgent] = useState(ticket.agent || "");
  const [priority, setPriority] = useState(ticket.priority);
  const [showAttachment, setShowAttachment] = useState(false);
  const [messages, setMessages] = useState(
  ticket.messages || []
);

  // const THREAD = [
  //   { from: "user", name: ticket.user, initials: ticket.initials, cc: ac(idx), time: "9:41 AM", text: `Hi, I'm experiencing an issue: "${ticket.title}". Can you help resolve this?` },
  //   { from: "agent", name: ticket.agent || "Support", initials: (ticket.agent || "SP").split(" ").map(w => w[0]).join("").slice(0, 2), cc: "bg-[#2d4a36] text-[#F6F4F0]", time: "10:05 AM", text: "Thanks for reaching out! I've reviewed your account and I'm looking into this right now. Could you provide a bit more detail?" },
  //   { from: "user", name: ticket.user, initials: ticket.initials, cc: ac(idx), time: "10:22 AM", text: "It started happening yesterday afternoon. I've tried refreshing and logging out but the issue persists." },
  // ];

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-[#2d4a36]/20 backdrop-blur-sm" />
      <div className="w-[520px] bg-white h-full flex flex-col shadow-[-10px_0_40px_rgba(45,74,54,0.1)] border-l border-[#8fa797]/20" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-[#8fa797]/10 flex items-start justify-between gap-4 bg-[#F6F4F0]/30">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[11px] font-bold text-[#8fa797] mb-1.5">{ticket.ticketId}</div>
            <div className="text-[16px] font-bold text-[#2d4a36] leading-snug tracking-tight">{ticket.title}</div>
            <div className="px-0 py-0 border-b border-[#8fa797]/10 bg-[#F6F4F0]/20">
  {/* <div className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest mb-2">
    Description
  </div> */}

  <div className="max-h-15 overflow-y-auto scrollbar-custom rounded-xl border border-[#8fa797]/20 bg-white p-4">
    <p className="text-[13px] leading-6 text-[#2d4a36] whitespace-pre-wrap">
      {ticket.description}
    </p>
  </div>
</div>


           



            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={status} />
              <PriorityBadge priority={priority} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa797] hover:bg-[#8fa797]/10 hover:text-[#2d4a36] transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </button>
        </div>

        
        
        <div className="px-6 py-1 border-b border-[#8fa797]/10 flex items-center gap-3">
          <Av
  image={ticket.user?.profilePicture}
  initials={ticket.user?.username?.charAt(0) || "G"}
  cc={ac(idx)}
  size="md"
/>
          <div>
            <div className="text-[13px] font-bold text-[#2d4a36]">{ticket.user.username}</div>
            <div className="text-[11px] font-medium text-[#8fa797]">{ticket.email}</div>
          </div>
          <div className="ml-auto text-right">
            {/* <div className="text-[10px] font-bold text-[#8fa797]/70 uppercase tracking-widest mb-0.5">Opened</div> */}


 <div className="px-4 py-2  flex items-center gap-3">
            {ticket?.attachment?.fileName && (
  <div className="px-6 py-4 border-b border-[#8fa797]/10 bg-offwhite rounded-2xl">
    <div className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest mb-2">
      Attachment
    </div>

    <button
      onClick={() => setShowAttachment(true)}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-[#8fa797]/20 hover:bg-[#F6F4F0] transition-colors"
    >
      <div className="text-xl">📎</div>

      <div className="flex-1 text-left">
        <div className="text-[13px] font-bold text-[#2d4a36]">
          {ticket.attachment.fileName}
        </div>
      </div>
    </button>
  </div>
)}
            
            </div>





            
          </div>
        </div>


              {/* <div className="px-6 py-4 border-b border-[#8fa797]/10 bg-[#F6F4F0]/20">
 <div className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest mb-2">Description : 
               {ticket.description}
            </div>
            </div> */}


        <div className="px-6 py-4 border-b border-[#8fa797]/10 grid grid-cols-2 gap-3 bg-offwhite">
          {[
            { label: "Status", val: status, set: setStatus, opts: ["Open", "In progress", "Resolved",] },
            { label: "Priority", val: priority, set: setPriority, opts: ["High", "Medium", "Low"] },
            // { label: "Agent", val: agent, set: setAgent, opts: ["", ...AGENTS.map(a => a.name)], display: v => v ? v.split(" ")[0] : "Unassigned" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[10px] font-bold text-[#8fa797] uppercase tracking-widest block mb-1.5">{f.label}</label>
              <select value={f.val} onChange={e => f.set(e.target.value)} className="w-full text-[12px] font-medium px-2.5 py-2 border border-[#8fa797]/20 rounded-xl bg-white text-[#2d4a36] focus:outline-none focus:ring-2 focus:ring-[#8fa797]/40 transition-shadow cursor-pointer">
                {f.opts.map(o => <option key={o} value={o}>{o || "Unassigned"}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 bg-white">
          <div className=" font-bold text-cardtitle uppercase tracking-widest text-center">Admin Response</div>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.from === "agent" ? "flex-row-reverse" : ""}`}>
              {/* <Av initials={msg.initials} cc={msg.cc} size="sm" /> */}
              {/* <div className={`flex-1 max-w-[360px] ${msg.from === "agent" ? "items-end flex flex-col" : ""}`}>
                <div className={`flex items-center gap-2 mb-1 ${msg.from === "agent" ? "flex-row-reverse" : ""}`}>
                  <span className="text-[11px] font-bold text-[#2d4a36]">{msg.name}</span>
                  <span className="text-[10px] font-medium text-[#8fa797]">{msg.time}</span>
                </div> */}
                <div className={`text-[13px] leading-relaxed px-4 py-3 border shadow-sm ${msg.from === "agent" ? "bg-[#2d4a36] text-[#F6F4F0] border-[#2d4a36] rounded-[20px] rounded-tr-sm" : "bg-[#F6F4F0] text-[#2d4a36] border-[#8fa797]/20 rounded-[20px] rounded-tl-sm"}`}>
                  {msg.message}
                </div>
              </div>
            // </div>
          ))}
          {reply && (
            <div className="flex gap-3 flex-row-reverse animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Av initials="AD" cc="bg-[#2d4a36] text-[#F6F4F0]" size="sm" />
              <div className="flex-1 max-w-[360px] items-end flex flex-col">
                <div className="flex items-center gap-2 flex-row-reverse mb-1">
                  <span className="text-[11px] font-bold text-[#2d4a36]">Admin</span>
                  <span className="text-[10px] font-medium text-[#8fa797]">Now</span>
                </div>
                <div className="text-[13px] leading-relaxed px-4 py-3 rounded-[20px] rounded-tr-sm bg-[#2d4a36] text-[#F6F4F0] shadow-sm">
                  {reply}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#8fa797]/20 bg-white">
          <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply…" className="w-full text-[13px] font-medium px-4 py-3 border border-[#8fa797]/30 rounded-2xl bg-[#F6F4F0]/50 text-[#2d4a36] placeholder-[#8fa797] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8fa797]/40 resize-none transition-all" rows={3} />
          <div className="flex items-center justify-between mt-3">
            <button onClick={async () => {
  await onUpdate(ticket._id, {
    status,
    priority,
  });

  onClose();
}} className="text-[13px] font-bold bg-[#2d4a36] text-[#F6F4F0] px-6 py-2.5 rounded-full hover:bg-[#8fa797] hover:text-[#2d4a36] shadow-md shadow-[#2d4a36]/10 transition-all disabled:opacity-40 disabled:hover:bg-[#2d4a36] disabled:hover:text-[#F6F4F0] disabled:cursor-not-allowed">
              Save changes
            </button>
            <button onClick={async () => {
const data = await api(
  `/api/help/reply-ticket/${ticket._id}`,
  {
    method: "POST",
    body: JSON.stringify({
      message: reply.trim(),
    }),
  }
);

setMessages(data.messages);

setReply("");
}} disabled={!reply.trim()} className="text-[13px] font-bold bg-[#2d4a36] text-[#F6F4F0] px-6 py-2.5 rounded-full hover:bg-[#8fa797] hover:text-[#2d4a36] shadow-md shadow-[#2d4a36]/10 transition-all disabled:opacity-40 disabled:hover:bg-[#2d4a36] disabled:hover:text-[#F6F4F0] disabled:cursor-not-allowed">
              Send reply
            </button>
          </div>
        </div>
      </div>

{showAttachment && (
  <div
    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
    onClick={() => setShowAttachment(false)}
  >
    <button
  onClick={(e) => {
    e.stopPropagation();
    setShowAttachment(false);
  }}
      className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white text-black font-bold text-xl flex items-center justify-center"
    >
      ✕
    </button>

    <div
      className="max-w-[90vw] max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={ticket.attachment.url}
        alt={ticket.attachment.fileName}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
      />
    </div>
  </div>
)}

    </div>
  );
}