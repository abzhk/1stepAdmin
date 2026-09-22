import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { api } from "../../../utils/api.js";

export default function EmailChangeRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await api('/api/help/email-change-requests');
      if (data.success) {
        setRequests(data.tickets);
      } else {
        toast.error("Failed to load requests.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading email change requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ticketId) => {
    setApproving(ticketId);
    try {
      const data = await api(`/api/help/approve-email-change/${ticketId}`, { method: 'POST' });
      if (data.success) {
        toast.success("Request approved.");
        setRequests(prev => prev.map(t => 
          t._id === ticketId ? { ...t, emailChangeStatus: 'approved', status: 'In progress' } : t
        ));
      } else {
        toast.error(data.message || "Failed to approve.");
      }
    } catch (err) {
      toast.error("Error approving request.");
    } finally {
      setApproving(null);
    }
  };

  const grouped = requests.reduce((acc, t) => {
    const d = new Date(t.createdAt);
    let key;
    if (isToday(d)) key = "Today";
    else if (isYesterday(d)) key = "Yesterday";
    else key = format(d, 'dd MMM yyyy');

    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 mt-6">
        <div className="text-4xl mb-4">📬</div>
        <h3 className="text-gray-900 font-semibold mb-2">No Email Change Requests</h3>
        <p className="text-gray-500 text-sm">When users request to change their email, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-6 overflow-y-auto pb-20">
      {Object.entries(grouped).map(([dateLabel, group]) => (
        <div key={dateLabel}>
          <h3 className="text-sm font-semibold text-gray-500 mb-4 px-2 border-b pb-2">{dateLabel} ({group.length})</h3>
          <div className="space-y-4">
            {group.map(t => (
              <div key={t._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-hover hover:border-[#10b981]/30">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {t.displayName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{t.displayName}</h4>
                      <span className="text-xs text-gray-400 font-mono">#{t.ticketId}</span>
                      {t.emailChangeStatus === 'pending' && <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider">Pending</span>}
                      {t.emailChangeStatus === 'approved' && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">Approved</span>}
                      {t.emailChangeStatus === 'completed' && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">Completed</span>}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="w-24 text-gray-400">Current:</span> 
                        <span className="font-medium text-gray-700">{t.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="w-24 text-gray-400">Requested:</span> 
                        <span className="font-medium text-[#10b981]">{t.requestedNewEmail}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-3">
                      Submitted at {format(new Date(t.createdAt), 'hh:mm a')}
                    </div>
                  </div>
                </div>

                <div>
                  {t.emailChangeStatus === 'pending' && (
                    <button
                      onClick={() => handleApprove(t._id)}
                      disabled={approving === t._id}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg shadow disabled:opacity-50 transition-colors"
                    >
                      {approving === t._id ? "Approving..." : "Approve Request"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
