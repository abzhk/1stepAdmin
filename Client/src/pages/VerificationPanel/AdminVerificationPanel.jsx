import { useState, useMemo, useRef } from "react";
import ApplicantList from "../../Components/Verification/ApplicationList";
import StatsRow from "../../Components/Verification/StatsRow";
import DetailPanel from "./DetailPanel";

//Ui designed by Gokul
const INITIAL_DATA = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    role: "Speech Therapist",
    city: "Bangalore",
    phone: "+91 98450 12345",
    email: "priya.sharma@example.com",
    initials: "PS",
    color: "bg-[#8fa797]/30 text-[#2d4a36]",
    submittedTs: Date.now() - 2 * 60 * 60 * 1000,
    priority: "high",
    identity: { aadhaar: "verified", pan: "verified", selfie: "verified", otp: "verified" },
    qualification: { degree: "BASLP", university: "AIISH, Mysore", year: "2019", certificate: "uploaded", rci: "RCI/SP/2019/04517", rciStatus: "verified" },
    practice: { clinic: "Hear & Speak Clinic", role: "Owner", address: "12, 3rd Cross, Indiranagar, Bangalore – 560038", type: "In-clinic", photo: "uploaded", proof: "uploaded" },
    payment: { name: "Dr. Priya Sharma", account: "•••• 4812", ifsc: "HDFC0001204", cheque: "uploaded" },
    docs: [
      { id: "d1", name: "aadhaar_front.jpg", type: "Aadhaar", size: "1.2 MB", status: "verified" },
      { id: "d2", name: "pan_card.jpg", type: "PAN", size: "890 KB", status: "verified" },
      { id: "d3", name: "degree_cert.pdf", type: "Degree Certificate", size: "2.1 MB", status: "pending" },
      { id: "d4", name: "clinic_photo.jpg", type: "Clinic Photo", size: "3.4 MB", status: "verified" },
      { id: "d5", name: "cheque_scan.jpg", type: "Cancelled Cheque", size: "780 KB", status: "pending" },
    ],
    notes: [],
    history: [{ ts: Date.now() - 2 * 60 * 60 * 1000, action: "Claim submitted", by: "Applicant" }],
    overall: "pending",
  },
  {
    id: 2,
    name: "Rajan Krishnamurthy",
    role: "Occupational Therapist",
    city: "Chennai",
    phone: "+91 94441 67890",
    email: "rajan.k@example.com",
    initials: "RK",
    color: "bg-[#ffd333]/40 text-[#2d4a36]",
    submittedTs: Date.now() - 5 * 60 * 60 * 1000,
    priority: "medium",
    identity: { aadhaar: "verified", pan: "pending", selfie: "verified", otp: "verified" },
    qualification: { degree: "BOT", university: "SRM University", year: "2016", certificate: "uploaded", rci: "RCI/OT/2016/07831", rciStatus: "pending" },
    practice: { clinic: "RehabPlus Centre", role: "Employee", address: "45, Adyar Bridge Rd, Chennai – 600020", type: "Both", photo: "uploaded", proof: "missing" },
    payment: { name: "Rajan K", account: "•••• 9203", ifsc: "ICIC0002341", cheque: "missing" },
    docs: [
      { id: "d6", name: "aadhaar_scan.pdf", type: "Aadhaar", size: "1.8 MB", status: "verified" },
      { id: "d7", name: "degree_bot.pdf", type: "Degree Certificate", size: "1.6 MB", status: "pending" },
      { id: "d8", name: "clinic_photo.png", type: "Clinic Photo", size: "2.9 MB", status: "verified" },
    ],
    notes: [{ id: "n1", ts: Date.now() - 3 * 60 * 60 * 1000, by: "Admin", text: "PAN card upload is blurry. Requested reupload via email." }],
    history: [
      { ts: Date.now() - 5 * 60 * 60 * 1000, action: "Claim submitted", by: "Applicant" },
      { ts: Date.now() - 3 * 60 * 60 * 1000, action: "Flagged for issues", by: "Admin" },
    ],
    overall: "issues",
  },
  {
    id: 3,
    name: "Dr. Anitha Menon",
    role: "Physiotherapist",
    city: "Kochi",
    phone: "+91 99001 23456",
    email: "anitha.menon@example.com",
    initials: "AM",
    color: "bg-[#f2a794]/40 text-[#2d4a36]",
    submittedTs: Date.now() - 24 * 60 * 60 * 1000,
    priority: "low",
    identity: { aadhaar: "verified", pan: "verified", selfie: "verified", otp: "verified" },
    qualification: { degree: "BPT", university: "Amrita Institute", year: "2020", certificate: "uploaded", rci: "IAP/PT/2020/11203", rciStatus: "verified" },
    practice: { clinic: "MG Physio Studio", role: "Owner", address: "8, MG Road, Ernakulam, Kochi – 682016", type: "Online", photo: "uploaded", proof: "uploaded" },
    payment: { name: "Anitha Menon", account: "•••• 6641", ifsc: "SBIN0007823", cheque: "uploaded" },
    docs: [
      { id: "d9",  name: "aadhaar_menon.jpg",  type: "Aadhaar",            size: "1.1 MB", status: "verified" },
      { id: "d10", name: "pan_menon.jpg",       type: "PAN",                size: "740 KB", status: "verified" },
      { id: "d11", name: "bpt_cert.pdf",        type: "Degree Certificate",size: "3.2 MB", status: "verified" },
      { id: "d12", name: "address_proof.pdf",   type: "Address Proof",     size: "900 KB", status: "verified" },
      { id: "d13", name: "cheque_menon.jpg",    type: "Cancelled Cheque",  size: "680 KB", status: "verified" },
    ],
    notes: [],
    history: [
      { ts: Date.now() - 24 * 60 * 60 * 1000, action: "Claim submitted", by: "Applicant" },
      { ts: Date.now() - 20 * 60 * 60 * 1000, action: "Documents verified", by: "Admin" },
      { ts: Date.now() - 18 * 60 * 60 * 1000, action: "Approved", by: "Admin" },
    ],
    overall: "approved",
  },
  {
    id: 4,
    name: "Suresh Babu",
    role: "Audiologist",
    city: "Hyderabad",
    phone: "+91 91234 56789",
    email: "suresh.b@example.com",
    initials: "SB",
    color: "bg-[#8fa797]/40 text-[#2d4a36]",
    submittedTs: Date.now() - 72 * 60 * 60 * 1000,
    priority: "high",
    identity: { aadhaar: "verified", pan: "verified", selfie: "failed", otp: "verified" },
    qualification: { degree: "MASLP", university: "JNTU Hyderabad", year: "2018", certificate: "missing", rci: "RCI/AU/2018/03342", rciStatus: "failed" },
    practice: { clinic: "SoundCare Audiology", role: "Owner", address: "77, Banjara Hills, Hyderabad – 500034", type: "In-clinic", photo: "missing", proof: "missing" },
    payment: { name: "Suresh B", account: "•••• 1190", ifsc: "AXIS0003421", cheque: "uploaded" },
    docs: [
      { id: "d14", name: "aadhaar_suresh.jpg", type: "Aadhaar",          size: "1.4 MB", status: "verified" },
      { id: "d15", name: "pan_suresh.pdf",     type: "PAN",              size: "800 KB", status: "verified" },
      { id: "d16", name: "cheque_sb.jpg",      type: "Cancelled Cheque", size: "760 KB", status: "pending" },
    ],
    notes: [{ id: "n2", ts: Date.now() - 60 * 60 * 1000, by: "Admin", text: "Selfie failed liveness check. RCI number returned error. Multiple docs missing. Recommend rejection." }],
    history: [
      { ts: Date.now() - 72 * 60 * 60 * 1000, action: "Claim submitted",   by: "Applicant" },
      { ts: Date.now() - 48 * 60 * 60 * 1000, action: "Sent for review",   by: "System" },
      { ts: Date.now() -      60 * 60 * 1000, action: "Rejected",          by: "Admin" },
    ],
    overall: "rejected",
  },
];

// ── UTILS ─────────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function fmtTime(ts) {
  return new Date(ts).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ── CONFIG ────────────────────────────────────────────────────────────────────

const statusCfg = {
  verified: { label: "Verified", bg: "bg-[#8fa797]/20", text: "text-[#2d4a36]", border: "border-[#8fa797]/50", dot: "bg-[#8fa797]" },
  pending:  { label: "Pending",  bg: "bg-[#ffd333]/20",  text: "text-[#2d4a36]", border: "border-[#ffd333]/50", dot: "bg-[#ffd333]"  },
  failed:   { label: "Failed",   bg: "bg-[#f2a794]/20",  text: "text-[#2d4a36]", border: "border-[#f2a794]/50", dot: "bg-[#f2a794]"  },
  missing:  { label: "Missing",  bg: "bg-[#F6F4F0]",   text: "text-[#8fa797]", border: "border-[#8fa797]/30", dot: "bg-[#8fa797]/50"  },
  uploaded: { label: "Uploaded", bg: "bg-[#8fa797]/10",  text: "text-[#2d4a36]", border: "border-[#8fa797]/30", dot: "bg-[#8fa797]"   },
  approved: { label: "Approved", bg: "bg-[#8fa797]/20", text: "text-[#2d4a36]", border: "border-[#8fa797]/50", dot: "bg-[#8fa797]" },
  issues:   { label: "Issues",   bg: "bg-[#ffd333]/30",  text: "text-[#2d4a36]", border: "border-[#ffd333]/60", dot: "bg-[#ffd333]"  },
  rejected: { label: "Rejected", bg: "bg-[#f2a794]/30",  text: "text-[#2d4a36]", border: "border-[#f2a794]/60", dot: "bg-[#f2a794]"  },
};

const priorityCfg = {
  high:   { label: "High",   bg: "bg-[#f2a794]/20",  text: "text-[#2d4a36]", border: "border-[#f2a794]/50" },
  medium: { label: "Medium", bg: "bg-[#ffd333]/20", text: "text-[#2d4a36]", border: "border-[#ffd333]/50" },
  low:    { label: "Low",    bg: "bg-[#F6F4F0]", text: "text-[#8fa797]", border: "border-[#8fa797]/30" },
};

const FIELD_STATUS_CYCLE = ["verified", "pending", "failed", "missing"];
const DOC_STATUSES       = ["pending", "verified", "failed", "missing"];




function Toast({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold pointer-events-auto
            ${t.type === "success" ? "bg-[#8fa797]/20 border-[#8fa797] text-[#2d4a36]"
              : t.type === "error" ? "bg-[#f2a794]/20 border-[#f2a794] text-[#2d4a36]"
              : "bg-[#2d4a36] border-[#2d4a36] text-[#F6F4F0]"}`}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}



export default function AdminVerificationPanel() {
  const [data,       setData]       = useState(INITIAL_DATA);
  const [selectedId, setSelectedId] = useState(1);
  const [filter,     setFilter]     = useState("all");
  const [sortBy,     setSortBy]     = useState("newest");
  const [search,     setSearch]     = useState("");
  const [toasts,     setToasts]     = useState([]);

  const selected = data.find(a => a.id === selectedId);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const handleDecision = (id, decision, reason) => {
    setData(prev => prev.map(a => {
      if (a.id !== id) return a;
      const histEntry  = { ts: Date.now(), action: `${decision.charAt(0).toUpperCase()}${decision.slice(1)}${reason ? ` — "${reason}"` : ""}`, by: "Admin" };
      const noteEntry  = reason ? [{ id: `n${Date.now()}`, ts: Date.now(), by: "Admin", text: reason }] : [];
      return { ...a, overall: decision, history: [...a.history, histEntry], notes: [...a.notes, ...noteEntry] };
    }));
    const labels = { approved: "Claim approved ✓", issues: "Fix requested", rejected: "Claim rejected", pending: "Claim reopened" };
    const types  = { approved: "success", issues: "info", rejected: "error", pending: "info" };
    showToast(labels[decision] || "Status updated", types[decision] || "info");
  };

  const handleDocStatusChange = (appId, docId, newStatus) => {
    setData(prev => prev.map(a =>
      a.id !== appId ? a : { ...a, docs: a.docs.map(d => d.id === docId ? { ...d, status: newStatus } : d) }
    ));
  };

  const handleNoteAdd = (appId, text) => {
    setData(prev => prev.map(a =>
      a.id !== appId ? a : { ...a, notes: [...a.notes, { id: `n${Date.now()}`, ts: Date.now(), by: "Admin", text }] }
    ));
  };

  const handleFieldStatusChange = (appId, section, field, newStatus) => {
    setData(prev => prev.map(a =>
      a.id !== appId ? a : { ...a, [section]: { ...a[section], [field]: newStatus } }
    ));
    showToast(`${field} → ${newStatus}`, "info");
  };

  const handlePriorityChange = (appId, priority) => {
    setData(prev => prev.map(a => a.id === appId ? { ...a, priority } : a));
  };

  return (
    <div className="h-screen bg-[#F6F4F0] flex flex-col font-sans overflow-hidden">
      <Toast toasts={toasts} />
     
      <StatsRow data={data} onFilterClick={f => { setFilter(f); }} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-[#8fa797]/30 flex flex-col overflow-hidden">
        <ApplicantList
  applicants={data}
  selectedId={selectedId}
  onSelect={setSelectedId}
  filter={filter}
  setFilter={setFilter}
  sortBy={sortBy}
  setSortBy={setSortBy}
  search={search}
  setSearch={setSearch}
/>
        </div>

        {/* Detail pane */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          {selected ? (
            <DetailPanel
              key={selected.id}
              applicant={selected}
              onDecision={handleDecision}
              onDocStatusChange={handleDocStatusChange}
              onNoteAdd={handleNoteAdd}
              onFieldStatusChange={handleFieldStatusChange}
              onPriorityChange={handlePriorityChange}
              showToast={showToast}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm font-medium text-[#8fa797]">
              Select a claim to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}