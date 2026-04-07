
    import React from "react";
import StatusBadge from "./StatusBadge";

const Document = ({
  applicant,
  verifiedDocs,
  setViewingDoc,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-[#8fa797] uppercase tracking-widest">
          Uploaded files
        </p>
        <span className="text-[10px] font-medium text-[#8fa797]">
          {applicant.docs.length} files · {verifiedDocs} verified
        </span>
      </div>

      {applicant.docs.length === 0 ? (
        <div className="text-center py-10 text-[#8fa797]/70 text-sm font-medium">
          No documents uploaded
        </div>
      ) : (
        <div className="space-y-2">
          {applicant.docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[#8fa797]/30 hover:border-[#8fa797] hover:bg-[#F6F4F0]/50 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F6F4F0] flex items-center justify-center flex-shrink-0">
                📄
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#2d4a36] truncate">
                  {doc.name}
                </p>
                <p className="text-[10px] font-medium text-[#8fa797]">
                  {doc.type} · {doc.size}
                </p>
              </div>

              <StatusBadge status={doc.status} small />

              <button
                onClick={() => setViewingDoc(doc)}
                className="p-1.5 hover:bg-white rounded-lg transition"
              >
                👁️
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Document;
