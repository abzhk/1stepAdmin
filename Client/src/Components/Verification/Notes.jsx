import React from "react";

const Notes = ({
  applicant,
  note,
  setNote,
  noteRef,
  handleNoteSubmit,
  fmtTime
}) => {
  return (
    <>
      <p className="text-xs font-bold text-[#8fa797] uppercase tracking-widest mb-3">
        Internal notes
      </p>

      {applicant.notes.length === 0 && (
        <p className="text-xs font-medium text-[#8fa797]/70 italic mb-4">
          No notes yet.
        </p>
      )}

      <div className="space-y-3 mb-5">
        {applicant.notes.map((n) => (
          <div
            key={n.id}
            className="bg-[#ffd333]/10 border border-[#ffd333]/40 rounded-xl px-4 py-3"
          >
            <p className="text-xs font-medium text-[#2d4a36] leading-relaxed">
              {n.text}
            </p>
            <p className="text-[10px] font-bold text-[#2d4a36]/50 mt-2">
              {n.by} · {fmtTime(n.ts)}
            </p>
          </div>
        ))}
      </div>

      <label className="block text-xs font-bold text-[#2d4a36]/60 mb-1.5">
        Add note
      </label>

      <textarea
        ref={noteRef}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Internal review notes (only visible to admins)…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleNoteSubmit();
        }}
        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#8fa797]/30 bg-white text-[#2d4a36] placeholder:text-[#8fa797]/70 focus:outline-none focus:ring-2 focus:ring-[#8fa797]/50 transition resize-none"
      />

      <div className="flex items-center justify-between mt-2">
        {/* <span className="text-[10px] font-medium text-[#8fa797]">
          ⌘/Ctrl+Enter to save
        </span> */}

        <button
          onClick={handleNoteSubmit}
          disabled={!note.trim()}
          className="px-4 py-1.5 text-xs font-bold bg-[#2d4a36] text-[#F6F4F0] rounded-lg hover:bg-[#2d4a36]/90 disabled:opacity-40 transition"
        >
          Save note
        </button>
      </div>
    </>
  );
};

export default Notes;