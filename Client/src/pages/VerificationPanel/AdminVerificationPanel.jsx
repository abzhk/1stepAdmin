import { useState, useMemo, useRef,useEffect } from "react";
import ApplicantList from "../../Components/Verification/ApplicationList.jsx";
import StatsRow from "../../Components/Verification/StatsRow.jsx";
import DetailPanel from "./DetailPanel.jsx";
import {api} from "../../utils/api.js";
import toast from "react-hot-toast";



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
  // const [data,       setData]       = useState(INITIAL_DATA);
  const [selectedId, setSelectedId] = useState(null);
  const [filter,     setFilter]     = useState("all");
  const [sortBy,     setSortBy]     = useState("newest");
  const [search,     setSearch]     = useState("");
  const [toasts,     setToasts]     = useState([]);
  const [data, setData] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
const [detailLoading, setDetailLoading] = useState(false);
const [decisionLoading, setDecisionLoading] = useState(false);

//fetch claim profiles
  const fetchClaims = async () => {
  try {
    const res = await api("/api/claim/admin/queue");
    console.log(res);

    setData(
      res.data.map((claim) => ({
        id: claim._id,
        name: claim.userId?.username || "Unknown",
        email: claim.userId?.email || "",
        role: "Therapist",
        city: "-",
        phone: "-",

        initials:
          claim.userId?.username
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "NA",

        color: "bg-[#8fa797]/30 text-[#2d4a36]",

        submittedTs: new Date(
          claim.submittedAt || claim.createdAt
        ).getTime(),

        priority: "medium",

        status: claim.status,

overall:
  claim.status === "submitted" || claim.status === "under_review"
    ? "pending"
    : claim.status === "fix_requested"
    ? "issues"
    : claim.status,

        docs: [],
        notes: [],
        history: [],
      }))
    );
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchClaims();
}, []);

const fetchClaimDetail = async (claimId) => {
  try {
    setDetailLoading(true);

    const res = await api(`/api/claim/admin/${claimId}`);

    setSelectedDetail(res.data);
  } catch (err) {
    console.error("Failed to fetch detail:", err);
  } finally {
    setDetailLoading(false);
  }
};

useEffect(() => {
  if (selectedId) {
    fetchClaimDetail(selectedId);
  }
}, [selectedId]);

  const selected = data.find(a => a.id === selectedId);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

//final approve
const handleDecision = async (id, decision, reason, category) => {
  if (decisionLoading) return;

  setDecisionLoading(true);

  try {
    const response = await api(`/api/claim/admin/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({
        action: decision,
        reason,
        category,
      }),
    });

    showToast("Claim updated successfully", "success");

    // Refresh list
    await fetchClaims();

    // Refresh selected claim
    if (selectedId === id) {
      await fetchClaimDetail(id);
    }

    return response;
  } catch (err) {
    console.error("Claim decision error:", err);
    showToast(err?.message || "Failed to update claim", "error");
    throw err;
  } finally {
    setDecisionLoading(false);
  }
};

const handleDocStatusChange = async (appId, docId, newStatus) => {
  try {
    await api(`/api/claim/admin/document/${docId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    setSelectedDetail((prev) => {
      if (!prev) return prev;

      const updatedDocs = prev.documents.map((doc) =>
        doc._id === docId
          ? { ...doc, docStatus: newStatus }
          : doc
      );

      const updatedIdentity = { ...prev.identity };

      const changedDoc = updatedDocs.find(d => d._id === docId);

      if (changedDoc) {
        const status = newStatus === "accepted" ? "verified" : "pending";

        switch (changedDoc.docType) {
          case "aadhaar_front":
          case "aadhaar_back":
            updatedIdentity.aadhaar = status;
            break;

          case "pan_card":
            updatedIdentity.pan = status;
            break;

          case "selfie_liveness":
            updatedIdentity.selfie = status;
            break;

          default:
            break;
        }
      }

      return {
        ...prev,
        documents: updatedDocs, 
        identity: updatedIdentity,
      };
    });

    showToast("Document status updated", "success");
  } catch (err) {
    showToast("Failed to update document", "error");
  }
};

// add notes 
 const handleNoteAdd = async (claimId, text) => {
  try {
    await api(`/api/claim/admin/${claimId}/note`, {
      method: "PATCH",
      body: JSON.stringify({
        note: text,
      }),
    });

    toast.success("Note saved", "success");

    await fetchClaimDetail(claimId);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save note", "error");
  }
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

  console.log("SELECTED LIST:", selected);
console.log("SELECTED DETAIL:", selectedDetail);
console.log("CLAIM STATUS:", selectedDetail?.claim?.status);

  return (
    <div className="h-screen bg-[#F6F4F0] flex flex-col font-sans overflow-hidden rounded-3xl">
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
           applicant={{
  ...selected,
  ...(selectedDetail?.claim || {}),
  city:
    selectedDetail?.profile?.practice?.address?.city || "-",


  qualificationList: selectedDetail?.profile?.qualifications || [],

 practiceList: selectedDetail?.profile?.practice || [],

  identity: selectedDetail?.identity || {},
  payment: selectedDetail?.payment || {},
docs: (selectedDetail?.documents || []).map((doc) => ({
  id: doc._id,
  name: doc.fileName,
  type: doc.docType,
  size: `${(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB`,
  status: doc.docStatus,
  itemIndex: doc.itemIndex, 
  fileRef: doc.fileRef,
  downloadUrl: doc.downloadUrl,
})),
 history: (selectedDetail?.auditLogs || []).map((log) => ({
  id: log._id,
  action: log.action,
  by: log.performedBy?.username || "System",
  ts: log.createdAt,
})),
}}
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