import React, { useState, useRef } from "react";
import StatusBadge from "../../Components/Verification/StatusBadge";
import PriorityBadge from "../../Components/Verification/PriorityBadge";
import Overview from "../../Components/Verification/Overview";
import Document from "../../Components/Verification/Document";
import History from "../../Components/Verification/History";
import Notes from "../../Components/Verification/Notes";
import ConfirmModal from "../../Components/Verification/ConfirmModal";
import MessageModal from "../../Components/Verification/MessageModel";
import { api } from "../../utils/api";

function DocViewerModal({ doc, onClose, onStatusChange,  canChangeStatus, isClaimLocked, }) {
  const activeCls = "bg-[#2d4a36] text-[#F6F4F0] border-transparent";
  const dotColors = {
    accepted: "bg-[#8fa797]",
    pending: "bg-[#ffd333]",
    rejected: "bg-[#f2a794]",
  };
  const isPdf =
    doc.fileRef?.toLowerCase().includes(".pdf") ||
    doc.name?.toLowerCase().endsWith(".pdf");
  return (
    <Backdrop>
      <div className="bg-white rounded-2xl shadow-xl border border-[#8fa797]/20 w-[98vw] max-w-none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#8fa797]/15">
          <div>
            <p className="text-sm font-bold text-[#2d4a36]">{doc.name}</p>
            <p className="text-xs text-[#8fa797]">
              {doc.type} · {doc.size}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F6F4F0] rounded-lg transition text-[#8fa797] hover:text-[#2d4a36]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 py-6 w-full">
          <div className="h-[500px] bg-[#F6F4F0]/50 rounded-xl flex flex-col items-center justify-center border border-[#8fa797]/20 mb-5">
            <svg
              className="w-10 h-10 text-[#8fa797]/70 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border border-[#8fa797]/20 mb-5 bg-[#F6F4F0]">
              {isPdf ? (
                <iframe
                  src={doc.downloadUrl}
                  title={doc.name}
                  className="w-full h-full"
                />
              ) : (
                <img
                  src={doc.downloadUrl}
                  alt={doc.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
          {canChangeStatus ? (
  <>
    <p className="text-xs font-semibold text-[#2d4a36]/60 mb-2">
      Set document status
    </p>

    <div className="flex gap-2 flex-wrap">
    {DOC_STATUSES.map((s) => (
  <button
    key={s}
    disabled={isClaimLocked}
    onClick={() => {
      if (isClaimLocked) return;
      onStatusChange(s);
    }}
    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize border transition
      ${
        doc.status === s
          ? `${activeCls}`
          : "border-[#8fa797]/30 text-[#2d4a36]/70 hover:bg-[#F6F4F0]"
      }
      ${
        isClaimLocked
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer"
      }`}
  >
    <span className={`w-2 h-2 rounded-full ${dotColors[s]}`} />
    {s}
  </button>
))}
    </div>
  </>
) : (
  <div className="px-3 py-2.5 rounded-lg bg-[#F6F4F0] border border-[#8fa797]/20">
    <p className="text-xs font-semibold text-[#2d4a36]">
      Document status is locked
    </p>

    <p className="text-[10px] text-[#8fa797] mt-0.5">
      Document status cannot be changed after this claim decision.
    </p>
  </div>
)}
        </div>
      </div>
    </Backdrop>
  );
}

const FIELD_STATUS_CYCLE = ["verified", "pending", "failed", "missing"];
const DOC_STATUSES = ["pending", "accepted", "rejected"];

function Backdrop({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      {children}
    </div>
  );
}

function CollapsibleSection({ title, icon, open, onToggle, children }) {
  return (
    <div className="border border-[#8fa797]/30 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F6F4F0]/50 hover:bg-[#F6F4F0] transition text-left"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-xs font-bold text-[#2d4a36]/80">{title}</span>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-[#8fa797] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div className="px-4 pb-2 pt-1 bg-white">{children}</div>}
    </div>
  );
}

function KVRow({ label, value, mono }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 py-2 border-b border-[#8fa797]/15">
      <span className="text-xs font-medium text-[#2d4a36]/70">{label}</span>
      <span
        className={`text-xs font-bold text-[#2d4a36] ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

const DetailPanel = ({
  applicant,
  onDecision,
  onDocStatusChange,
  onNoteAdd,
  onFieldStatusChange,
  onPriorityChange,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [note, setNote] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmReason, setConfirmReason] = useState("");
  const [viewingDoc, setViewingDoc] = useState(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    identity: true,
    qualification: true,
    practice: true,
    payment: true,
  });
  const noteRef = useRef(null);
  const [confirmCategory, setConfirmCategory] = useState("");

  const totalDocs = applicant.docs.length;

const verifiedDocs = applicant.docs.filter(
  (d) => d.status === "accepted"
).length;

const progress =
  totalDocs > 0
    ? Math.round((verifiedDocs / totalDocs) * 100)
    : 0;

const allDocsApproved =
  totalDocs > 0 &&
  verifiedDocs === totalDocs;

const isClaimLocked =
  applicant.status === "approved" ||
  applicant.status === "rejected";

const isWaitingForProvider =
  applicant.status === "fix_requested";

const canReview =
  applicant.status === "submitted" ||
  applicant.status === "under_review";

  const cycleField = (section, field) => {
    const cur = applicant[section][field];
    const next =
      FIELD_STATUS_CYCLE[
        (FIELD_STATUS_CYCLE.indexOf(cur) + 1) % FIELD_STATUS_CYCLE.length
      ];
    onFieldStatusChange(applicant.id, section, field, next);
  };

  const handleConfirm = () => {
    onDecision(applicant.id, confirmAction, confirmReason, confirmCategory);
    setConfirmAction(null);
    setConfirmReason("");
    setConfirmCategory("");
  };

  const handleNoteSubmit = () => {
    if (!note.trim()) return;
    onNoteAdd(applicant.id, note.trim());
    setNote("");
    showToast("Note saved", "success");
  };

  const toggleSection = (s) =>
    setExpandedSections((p) => ({ ...p, [s]: !p[s] }));

  const tabs = ["overview", "documents", "history", "notes"];

  const liveViewingDoc = viewingDoc
    ? applicant.docs.find((d) => d.id === viewingDoc.id) || null
    : null;

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
  function fmtTime(ts) {
    return new Date(ts).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function CycleBtn({ onClick }) {
    return (
      <button
        onClick={onClick}
        title="Cycle status"
        className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#F6F4F0] transition text-[#8fa797] hover:text-[#2d4a36] flex-shrink-0"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    );
  }

  function CheckRow({ label, status, onCycle }) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-[#8fa797]/15 last:border-0">
        <span className="text-xs text-[#2d4a36]/80">{label}</span>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={status} small />
          {onCycle && <CycleBtn onClick={onCycle} />}
        </div>
      </div>
    );
  }

  return (
    <>
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          reason={confirmReason}
          setReason={setConfirmReason}
          category={confirmCategory}
          setCategory={setConfirmCategory}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {liveViewingDoc && (
        <DocViewerModal
          doc={liveViewingDoc}
          isClaimLocked={isClaimLocked}
           canChangeStatus={!isClaimLocked}
          onClose={() => setViewingDoc(null)}
          onStatusChange={(s) => {
            onDocStatusChange(applicant.id, liveViewingDoc.id, s);
          }}
        />
      )}

      {showMsgModal && (
        <MessageModal
          applicant={applicant}
          onClose={() => setShowMsgModal(false)}
          onSend={async (channel, msg) => {
            try {
              await api(`/api/claim/admin/${applicant.id}/message`, {
                method: "POST",
                body: JSON.stringify({
                  channel,
                  message: msg,
                }),
              });

              showToast("Message sent", "success");
            } catch (err) {
              showToast("Failed to send message", "error");
            }
          }}
        />
      )}

      <div className="flex flex-col h-full bg-white">
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-[#8fa797]/20 flex-shrink-0">
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${applicant.color}`}
            >
              {applicant.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#2d4a36]">
                  {applicant.name}
                </h2>
                {/* <PriorityBadge
                  priority={applicant.priority}
                  onClick={() => {
                    const order = ["low", "medium", "high"];
                    const next =
                      order[
                        (order.indexOf(applicant.priority) + 1) % order.length
                      ];
                    onPriorityChange(applicant.id, next);
                    showToast(`Priority → ${next}`, "info");
                  }}
                /> */}
                {isClaimLocked && (
                  <span className="text-[10px] text-[#8fa797] italic">
                    Locked
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-[#2d4a36]/60 mt-0.5">
                {applicant.role} 
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[10px] text-[#8fa797]">
                  {applicant.email}
                </span>
                <span className="text-[10px] text-[#8fa797]">
                  {applicant.phone}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <StatusBadge status={applicant.overall} />
              <span className="text-[10px] text-[#8fa797]">
                {timeAgo(applicant.submittedTs)}
              </span>
            </div>
          </div>

          <div className="flex justify-between mb-1">
            <span className="text-[10px] font-medium text-[#8fa797]">
              Document verification
            </span>
            <span className="text-[10px] font-bold text-[#2d4a36]/80">
              {verifiedDocs}/{totalDocs} verified · {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[#F6F4F0] rounded-full overflow-hidden mb-4">
            <div
              style={{ width: `${progress}%` }}
              className={`h-full rounded-full transition-all duration-500
                ${progress === 100 ? "bg-[#8fa797]" : progress > 60 ? "bg-[#ffd333]" : "bg-[#f2a794]"}`}
            />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowMsgModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#8fa797]/30 rounded-lg text-[#2d4a36]/80 hover:bg-[#F6F4F0] transition"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Message
            </button>
            <button
              onClick={() => {
                setActiveTab("notes");
                setTimeout(() => noteRef.current?.focus(), 80);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#8fa797]/30 rounded-lg text-[#2d4a36]/80 hover:bg-[#F6F4F0] transition"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Add note
            </button>
            {/* <button
              onClick={() => showToast("Profile link copied", "info")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#8fa797]/30 rounded-lg text-[#2d4a36]/80 hover:bg-[#F6F4F0] transition ml-auto"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy link
            </button> */}
          </div>

          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg capitalize transition
                  ${activeTab === t ? "bg-[#2d4a36] text-[#F6F4F0]" : "text-[#8fa797] hover:bg-[#F6F4F0]"}`}
              >
                {t}
                {t === "notes" && applicant.notes.length > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full
                    ${activeTab === t ? "bg-white/20 text-[#F6F4F0]" : "bg-[#F6F4F0] text-[#2d4a36]/70"}`}
                  >
                    {applicant.notes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {activeTab === "overview" && (
            <Overview
              applicant={applicant}
              isLocked={isClaimLocked}
              cycleField={cycleField}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            />
          )}

          {activeTab === "documents" && (
            <Document
              applicant={applicant}
              verifiedDocs={verifiedDocs}
              setViewingDoc={setViewingDoc}
            />
          )}

          {activeTab === "history" && (
            <History applicant={applicant} fmtTime={fmtTime} />
          )}

          {activeTab === "notes" && (
            <Notes
              applicant={applicant}
              note={note}
              setNote={setNote}
              noteRef={noteRef}
              handleNoteSubmit={handleNoteSubmit}
              fmtTime={fmtTime}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#8fa797]/20 bg-white flex-shrink-0">

  {/* APPROVED / REJECTED */}
  {isClaimLocked ? (
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-[#8fa797] italic">
        This claim is{" "}
        <strong className="text-[#2d4a36]">
          {applicant.overall}
        </strong>
        . Reopen to make changes.
      </p>

      <button
        onClick={async () => {
          try {
            await onDecision(
              applicant.id,
              "reopen",
              "pending",
              "Reopened for further review"
            );

            showToast("Claim reopened", "info");
          } catch (err) {
            showToast(
              err?.message || "Failed to reopen claim",
              "error"
            );
          }
        }}
        className="px-4 py-2 text-xs font-bold border border-[#8fa797]/30 rounded-xl text-[#2d4a36]/80 hover:bg-[#F6F4F0] transition"
      >
        Reopen
      </button>
    </div>

  ) : isWaitingForProvider ? (

    /* WAITING FOR PROVIDER */
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-[#2d4a36]">
          Waiting for provider
        </p>

        <p className="text-xs text-[#8fa797] mt-1">
          The provider has been asked to fix the requested issues
          and resubmit the claim.
        </p>
      </div>

      <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ffd333]/20 text-[#2d4a36] border border-[#ffd333]/50">
        Awaiting Resubmission
      </span>
    </div>

  ) : canReview ? (

    /* ADMIN REVIEW ACTIONS */
    <div className="flex gap-2">

      {/* APPROVE */}
      <button
        onClick={async () => {
          const totalDocs = applicant.docs.length;

          const verifiedDocs = applicant.docs.filter(
            (d) => d.status === "accepted"
          ).length;

          const allDocsApproved =
            totalDocs > 0 &&
            verifiedDocs === totalDocs;

          if (!allDocsApproved) {
            return showToast(
              "Approve all documents first",
              "error"
            );
          }

          try {
            await onDecision(
              applicant.id,
              "approve",
              ""
            );

          } catch (err) {
            showToast(
              err?.message || "Failed to approve claim",
              "error"
            );
          }
        }}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold bg-[#8fa797] text-[#2d4a36] rounded-xl hover:bg-[#8fa797]/80 active:scale-95 transition-all"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>

        Approve
      </button>

      {/* REQUEST FIX */}
      <button
  disabled={allDocsApproved}
  onClick={() => {
    if (allDocsApproved) {
      return;
    }

    setConfirmAction("request_fix");
  }}
  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-xl transition-all
    ${
      allDocsApproved
        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
        : "bg-[#ffd333] text-[#2d4a36] hover:bg-[#ffd333]/80 active:scale-95"
    }
  `}
>
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0"
    />
  </svg>

  {allDocsApproved ? "All Documents are Verified" : "Request Fix"}
</button>

      {/* REJECT */}
      <button
        onClick={() =>
          setConfirmAction("reject")
        }
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold bg-[#f2a794] text-[#2d4a36] rounded-xl hover:bg-[#f2a794]/80 active:scale-95 transition-all"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>

        Reject
      </button>

    </div>

  ) : (

    /* OTHER STATUS */
    <div className="flex items-center justify-center">
      <p className="text-xs text-[#8fa797] italic">
        This claim is not currently available for review.
      </p>
    </div>
  )}

</div>
</div>
    </>
  );
};
export default DetailPanel;
