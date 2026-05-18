import React from 'react'

const History = ({ applicant, fmtTime }) => {
  return (
    <div>

 <>
              <p className="text-xs font-bold text-[#8fa797] uppercase tracking-widest mb-3">Audit trail</p>
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-[#8fa797]/20" />
                <div className="space-y-5">
                  {[...applicant.history].reverse().map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-[#8fa797] border-2 border-white" />
                      <p className="text-xs font-bold text-[#2d4a36]/90">{h.action}</p>
                      <p className="text-[10px] font-medium text-[#8fa797] mt-0.5">{h.by} · {fmtTime(h.ts)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>


        
    </div>
  )
}

export default History