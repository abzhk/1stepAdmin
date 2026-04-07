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
        {onCycle && <CycleBtn onClick={onCycle} />}
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
  return (
    <div>

<CollapsibleSection title="Identity Verification" icon="🪪"
                open={expandedSections.identity} onToggle={() => toggleSection("identity")}>
                <CheckRow label="Aadhaar"     status={applicant.identity.aadhaar} onCycle={!isLocked ? () => cycleField("identity","aadhaar") : null} />
                <CheckRow label="PAN Card"    status={applicant.identity.pan}     onCycle={!isLocked ? () => cycleField("identity","pan")     : null} />
                <CheckRow label="Live selfie" status={applicant.identity.selfie}  onCycle={!isLocked ? () => cycleField("identity","selfie")  : null} />
                <CheckRow label="Mobile OTP"  status={applicant.identity.otp}     onCycle={!isLocked ? () => cycleField("identity","otp")     : null} />
              </CollapsibleSection>

             
              <CollapsibleSection title="Qualification & Registration" icon="🎓"
                open={expandedSections.qualification} onToggle={() => toggleSection("qualification")}>
                <KVRow label="Degree"     value={applicant.qualification.degree} />
                <KVRow label="University" value={applicant.qualification.university} />
                <KVRow label="Year"       value={applicant.qualification.year} />
                <CheckRow label="Degree certificate"
                  status={applicant.qualification.certificate === "uploaded" ? "uploaded" : "missing"}
                  onCycle={!isLocked ? () => cycleField("qualification","certificate") : null} />
                <div className="flex items-center justify-between py-2 last:border-0 border-b border-[#8fa797]/15">
                  <span className="text-xs text-[#2d4a36]/80">
                    Reg. No. <span className="font-mono text-[10px] text-[#8fa797] ml-1">{applicant.qualification.rci}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={applicant.qualification.rciStatus} small />
                    {!isLocked && <CycleBtn onClick={() => cycleField("qualification","rciStatus")} />}
                  </div>
                </div>
              </CollapsibleSection>

         
              <CollapsibleSection title="Practice Details" icon="🏥"
                open={expandedSections.practice} onToggle={() => toggleSection("practice")}>
                <div className="py-2 border-b border-[#8fa797]/15">
                  <p className="text-xs font-bold text-[#2d4a36]/90">{applicant.practice.clinic}</p>
                  <p className="text-[11px] text-[#8fa797] mt-0.5">{applicant.practice.address}</p>
                  <div className="flex gap-2 mt-1.5">
                    <span className="px-2 py-0.5 bg-[#F6F4F0] rounded text-[10px] text-[#2d4a36]/60 font-semibold">{applicant.practice.role}</span>
                    <span className="px-2 py-0.5 bg-[#F6F4F0] rounded text-[10px] text-[#2d4a36]/60 font-semibold">{applicant.practice.type}</span>
                  </div>
                </div>
                <CheckRow label="Clinic photo"  status={applicant.practice.photo === "uploaded" ? "uploaded" : "missing"} onCycle={!isLocked ? () => cycleField("practice","photo") : null} />
                <CheckRow label="Address proof" status={applicant.practice.proof === "uploaded" ? "uploaded" : "missing"} onCycle={!isLocked ? () => cycleField("practice","proof") : null} />
              </CollapsibleSection>

             
              <CollapsibleSection title="Payment Details" icon="💳"
                open={expandedSections.payment} onToggle={() => toggleSection("payment")}>
                <KVRow label="Account holder" value={applicant.payment.name} />
                <KVRow label="Account no."    value={applicant.payment.account} mono />
                <KVRow label="IFSC"           value={applicant.payment.ifsc}    mono />
                <CheckRow label="Cancelled cheque"
                  status={applicant.payment.cheque === "uploaded" ? "uploaded" : "missing"}
                  onCycle={!isLocked ? () => cycleField("payment","cheque") : null} />
              </CollapsibleSection>

    </div>
  )
}

export default Overview