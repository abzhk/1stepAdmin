import React from 'react'
import StatusBadge from "./StatusBadge";

const Overview = ({applicant,
  isLocked,
  cycleField,
  expandedSections,
  toggleSection,
}) => {

    function KVRow({ label, value, mono }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 py-2 border-b border-[#8fa797]/15">
      <span className="text-xs font-medium text-[#2d4a36]/70">{label}</span>
      <span className={`text-xs font-bold text-[#2d4a36] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function CycleBtn({ onClick }) {
  return (
    <button onClick={onClick} title="Cycle status"
      className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#F6F4F0] transition text-[#8fa797] hover:text-[#2d4a36] flex-shrink-0">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
        {/* {onCycle && <CycleBtn onClick={onCycle} />} */}
      </div>
    </div>
  );
}


    function CollapsibleSection({ title, icon, open, onToggle, children }) {
  return (
    <div className="border border-[#8fa797]/30 rounded-xl overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F6F4F0]/50 hover:bg-[#F6F4F0] transition text-left">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-xs font-bold text-[#2d4a36]/80">{title}</span>
        </div>
        <svg className={`w-3.5 h-3.5 text-[#8fa797] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-2 pt-1 bg-white">{children}</div>}
    </div>
  );
}


const getDocStatus = (type) => {
  const docs = applicant.docs.filter((d) => d.type === type);

  if (docs.length === 0) return "missing";

  if (docs.every(d => d.status === "accepted")) return "verified";
  if (docs.some(d => d.status === "rejected")) return "failed";

  return "pending";
};

const getCombinedStatus = (types) => {
  const statuses = types.map(t => getDocStatus(t));

  if (statuses.every(s => s === "verified")) return "verified";
  if (statuses.some(s => s === "failed")) return "failed";
  return "pending";
};
  return (
    <div>

<CollapsibleSection title="Identity Verification" icon="🪪"
                open={expandedSections.identity} onToggle={() => toggleSection("identity")}>
              <CheckRow
  label="Aadhaar"
  status={getCombinedStatus(["aadhaar_front", "aadhaar_back"])}
/>

<CheckRow
  label="PAN Card"
  status={getDocStatus("pan_card")}
/>

<CheckRow
  label="Live selfie"
  status={getDocStatus("selfie_liveness")}
/>
<CheckRow label="RCI Certificate"  status={getDocStatus("rci_certificate")} />
              </CollapsibleSection>

             
             <CollapsibleSection
  title="Qualification & Registration"
  icon="🎓"
  open={expandedSections.qualification}
  onToggle={() => toggleSection("qualification")}
>
  {(applicant.qualificationList || []).length === 0 ? (
    <p className="text-xs text-[#8fa797]">No qualifications found</p>
  ) : (
    applicant.qualificationList.map((q, index) => (
      <div
        key={index}
        className="mb-3 pb-2 border-b border-[#8fa797]/15 last:border-0"
      >
        {/*  Optional heading */}
        <p className="text-[11px] font-bold text-[#2d4a36]/70 mb-1">
          Qualification {index + 1}
        </p>

        <KVRow label="Degree" value={q.degree || "-"} />
        <KVRow label="University" value={q.university || "-"} />
        {/* <KVRow label="Year" value={q.yearOfCompletion || "-"} /> */}
        <KVRow label="Start Year" value={q.startDate || "-"}/>

        <CheckRow
          label="Degree certificate"
          status={getDocStatus("degree_certificate", index)}
          onCycle={
            !isLocked
              ? () => cycleField("qualification", "certificate")
              : null
          }
        />

        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-[#2d4a36]/80">
            Reg. No.
            <span className="font-mono text-[10px] text-[#8fa797] ml-1">
              {q.registrationNumber?.masked || "-"}
            </span>
          </span>

          <div className="flex items-center gap-1.5">
            <StatusBadge
              status={q.registrationVerified ? "verified" : "pending"}
              small
            />
          </div>
        </div>
      </div>
    ))
  )}
</CollapsibleSection>

         
             <CollapsibleSection
  title="Practice Details"
  icon="🏥"
  open={expandedSections.practice}
  onToggle={() => toggleSection("practice")}
>
  {(applicant.practiceList || []).length === 0 ? (
    <p className="text-xs text-[#8fa797]">No practice details</p>
  ) : (
    applicant.practiceList.map((p, index) => (
      <div
        key={index}
        className="mb-3 pb-2 border-b border-[#8fa797]/15 last:border-0"
      >
        {/* Optional heading */}
        <p className="text-[11px] font-bold text-[#2d4a36]/70 mb-1">
          Practice {index + 1}
        </p>

        {/* Clinic */}
        <p className="text-xs font-bold text-[#2d4a36]/90">
          {p.clinicName || "-"}
        </p>

        {/* Address */}
        <p className="text-[11px] text-[#8fa797] mt-0.5">
          {p.address?.line1 || "-"}, {p.address?.city || ""}
        </p>

        {/* Tags */}
        <div className="flex gap-2 mt-1.5">
          <span className="px-2 py-0.5 bg-[#F6F4F0] rounded text-[10px]">
            {p.role || "-"}
          </span>

          <span className="px-2 py-0.5 bg-[#F6F4F0] rounded text-[10px]">
            {Array.isArray(p.consultationType)
              ? p.consultationType.join(", ")
              : p.consultationType || "-"}
          </span>
        </div>

        {/* Optional verification rows */}
        <CheckRow
          label="Clinic photo"
          status={getDocStatus("clinic_photo", index)}
          onCycle={
            !isLocked ? () => cycleField("practice", "photo") : null
          }
        />

        <CheckRow
          label="Address proof"
          status={getDocStatus("address_proof", index)}
          onCycle={
            !isLocked ? () => cycleField("practice", "proof") : null
          }
        />
      </div>
    ))
  )}
</CollapsibleSection>

             
             <CollapsibleSection
  title="Payment Details"
  icon="💳"
  open={expandedSections.payment}
  onToggle={() => toggleSection("payment")}
>
  <KVRow
    label="Account Holder"
    value={applicant.payment?.accountHolderName || "-"}
  />

  <KVRow
    label="Account Number"
    value={
  applicant.payment?.accountNumberMasked
    ? applicant.payment.accountNumberMasked
    : "-"
}
    mono
  />

  <KVRow
    label="IFSC"
    value={applicant.payment?.ifscCode || "-"}
    mono
  />

  {/* <KVRow
    label="Bank"
    value={applicant.payment?.bankName || "-"}
  /> */}

  <KVRow
    label="Verified"
    value={applicant.payment?.isVerified ? "Yes" : "No"}
  />
</CollapsibleSection>

    </div>
  )
}

export default Overview