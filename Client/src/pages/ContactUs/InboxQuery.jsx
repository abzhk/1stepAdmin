import { useState, useEffect, useRef } from "react";
import { api } from "../../utils/api";
import dateFormatUtils from "../../utils/dateFormatUtils";
import { IoSend } from "react-icons/io5";

const TAG_STYLES = {
  new: "bg-[#ffd333]/30 text-[#2d4a36] border border-[#ffd333]/50",
  crisis: "bg-[#f2a794]/20 text-[#2d4a36] font-bold border border-[#f2a794]/50",
  appointment: "bg-[#8fa797]/20 text-[#2d4a36] border border-[#8fa797]/30",
  billing: "bg-[#F6F4F0] text-[#2d4a36] border border-[#8fa797]/40",
  general: "bg-white text-[#2d4a36]/70 border border-[#8fa797]/20",
  replied: "bg-[#8fa797]/10 text-[#2d4a36]/60 border border-[#8fa797]/20",
};

const STATUS_DOT = {
  pending: "bg-[#ffd333]",
  "in-progress": "bg-[#8fa797]",
  replied: "bg-[#2d4a36]",
  resolved: "bg-green-500",
  closed: "bg-stone-300",
};

function Tag({ label }) {
  const cls = TAG_STYLES[label] || "bg-[#F6F4F0] text-[#2d4a36]/60 border border-[#8fa797]/20";
  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function ChatMessage({ message, isAdmin, timestamp, isFirst, isLast, source }) {
  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isAdmin ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isAdmin 
            ? 'bg-[#2d4a36] text-white rounded-tr-none' 
            : 'bg-white text-[#2d4a36] rounded-tl-none border border-[#8fa797]/20'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
          {source === 'email' && (
            <span className="text-[8px] opacity-60 mt-1 block">📧 via email</span>
          )}
        </div>
        <div className={`text-[10px] text-[#8fa797] mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
          {timestamp}
        </div>
      </div>
      <div className={`flex-shrink-0 ${isAdmin ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isAdmin 
            ? 'bg-[#2d4a36] text-white' 
            : 'bg-[#F6F4F0] text-[#2d4a36] border border-[#8fa797]/30'
        }`}>
          {isAdmin ? 'A' : 'C'}
        </div>
      </div>
    </div>
  );
}

export default function AdminInbox() {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [totalMessages, setTotalMessages] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  

  const filtered = msgs.filter((m) => {
    if (filter === "unread" && !m.unread) return false; 
    if (filter === "read" && m.unread) return false;
    
    const q = search.toLowerCase();
    if (q && !m.name.toLowerCase().includes(q) && !m.msg.toLowerCase().includes(q) && !m.reason.toLowerCase().includes(q)) return false;
    
    return true;
  });

  const active = msgs.find((m) => m.id === activeId);
  const unreadCount = msgs.filter((m) => m.unread).length;

  const openMsg = async (id) => {
  try {
    const res = await api(`/api/contact/${id}`);

    setMsgs(prev =>
      prev.map(m =>
        m.id === id
          ? {
              ...m,
              unread: false,
              status: "read",
              messages: res.data.messages,
            }
          : m
      )
    );

    setActiveId(id);
    setReplyText("");
    setReplyMessageId(null);
    setError(null);

  } catch (err) {
    console.log(err);
  }
};

  const sendReply = async (id) => {
    if (!replyText.trim() || sending) return;
    
    setSending(true);
    setError(null);
    
    try {
      const payload = {
        reply: replyText.trim(),
      };
      
      if (replyMessageId) {
        payload.messageId = replyMessageId;
      }

      const response = await api(`/api/contact/reply/${id}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.data) {
        setMsgs((prev) =>
          prev.map((m) => {
            if (m.id === id) {
              const updatedMessages = response.data.messages || m.messages;
              
              let latestReply = null;
              for (const msg of updatedMessages) {
                if (msg.replies && msg.replies.length > 0) {
                  const lastReply = msg.replies[msg.replies.length - 1];
                  if (!latestReply || new Date(lastReply.repliedAt) > new Date(latestReply.repliedAt)) {
                    latestReply = lastReply;
                  }
                }
              }

              return {
                ...m,
                status: response.data.status || "replied",
                tags: [...m.tags.filter((t) => t !== "new"), "replied"],
                adminReply: latestReply?.message || replyText,
                repliedAt: new Date().toISOString(),
                messages: updatedMessages,
                messageCount: updatedMessages.length,
                hasReplies: updatedMessages.some(msg => msg.replies && msg.replies.length > 0),
                latestReply: latestReply,
              };
            }
            return m;
          })
        );
      }

      setReplyText("");
      setReplyMessageId(null);
    } catch (err) {
      console.error("Error sending reply:", err);
      setError(err.message || "Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
  ];

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api(`/api/contact/getall?page=${page}&limit=5`);
      
      const formatted = res.data.map((item) => {
        const latestMessage = item.messages && item.messages.length > 0 
          ? item.messages[item.messages.length - 1] 
          : null;
        
        const hasReplies = item.messages?.some(msg => msg.replies && msg.replies.length > 0);
        const latestReply = item.messages?.reduce((latest, msg) => {
          if (msg.replies && msg.replies.length > 0) {
            const lastReply = msg.replies[msg.replies.length - 1];
            if (!latest || new Date(lastReply.repliedAt) > new Date(latest.repliedAt)) {
              return lastReply;
            }
          }
          return latest;
        }, null);

        // Determine if message came from email
        const isFromEmail = item.messages?.some(msg => msg.source === 'email');

        return {
          id: item._id,
          name: item.name,
          email: item.email,
          phone: item.phone || "",
          reason: item.helpCategories?.join(", ") || "General Inquiry",
          therapist: "",
          msg: latestMessage?.message || item.message || "No message content",
          adminReply: item.adminNotes || latestReply?.message || "",
          date: new Date(item.createdAt).toLocaleString(),
          unread: item.status === "pending",
          tags: [
            ...item.helpCategories?.map(cat => 
              cat.toLowerCase().includes("couples") ? "appointment" :
              cat.toLowerCase().includes("billing") ? "billing" :
              cat.toLowerCase().includes("general") ? "general" :
              "general"
            ) || ["general"],
            item.status === "pending" ? "new" : item.status,
            isFromEmail ? "email" : null,
          ].filter(Boolean),
          status: item.status,
          messages: item.messages || [],
          messageCount: item.messages?.length || 0,
          hasReplies: hasReplies,
          latestReply: latestReply,
          createdAt: item.createdAt,
          topicId: item.topicId,
          isFromEmail: isFromEmail,
        };
      });
      setTotalMessages(res.totalMessages);
//       setHasNextPage(
//   res.pagination.currentPage < res.pagination.totalPages
// );
setTotalPages(res.pagination.totalPages);
//       if (page === 1) {
//   setMsgs(formatted);
// } else {
//   setMsgs(prev => [...prev, ...formatted]);
// }
setMsgs(formatted);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message || "Failed to load messages. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page]);


  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [active?.messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d4a36] mx-auto"></div>
          <p className="mt-4 text-[#8fa797]">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-screen py-4 px-4 sm:px-6 lg:px-8 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-9xl flex-1 min-h-0 bg-white rounded-3xl overflow-hidden border border-[#8fa797]/30 flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 bg-[#F6F4F0] border-b border-[#8fa797]/20 gap-4">
          <div>
            {/* <h2 className="font-serif text-2xl font-medium text-[#2d4a36]">Inbox</h2> */}
            <p className="text-xs text-[#2d4a36]/60 mt-1 uppercase tracking-widest font-bold">Client Communications</p>
          </div>
          <div className="flex items-center gap-3">
            {/* <span className="text-xs font-semibold text-[#2d4a36]/80 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#8fa797]/30 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f2a794] inline-block animate-pulse" />
              {unreadCount} unread
            </span> */}
            <span className="bg-[#2d4a36] text-[#F6F4F0] text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm">
              {totalMessages} total
            </span>

            
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-8 my-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 px-8 py-4 bg-white border-b border-[#8fa797]/10 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                  filter === f.key
                    ? "bg-[#2d4a36] text-[#F6F4F0] border-[#2d4a36] shadow-md"
                    : "bg-[#F6F4F0] text-[#2d4a36]/70 border-[#8fa797]/30 hover:border-[#8fa797] hover:bg-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full md:w-64">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa797]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full text-sm pl-9 pr-4 py-2 rounded-full border border-[#8fa797]/40 bg-[#F6F4F0]/50 outline-none transition-all focus:bg-white focus:border-[#8fa797] focus:ring-4 focus:ring-[#8fa797]/20 text-[#2d4a36] placeholder:text-[#8fa797]"
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          
          {/* Message list */}
          <div className="w-full md:w-[350px] border-r border-[#8fa797]/20 bg-white flex-shrink-0 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-[#8fa797] p-8 text-center font-medium">
                  No messages match this filter.
                </div>
              ) : (
                filtered.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => openMsg(m.id)}
                    className={`relative px-6 py-5 border-b border-[#8fa797]/10 cursor-pointer transition-all duration-200 group ${
                      activeId === m.id 
                        ? "bg-[#F6F4F0] border-l-4 border-l-[#2d4a36]" 
                        : "hover:bg-[#F6F4F0]/50 border-l-4 border-l-transparent"
                    }`}
                  >
                    {m.unread && (
                      <span className="absolute left-3 top-6 w-2 h-2 rounded-full bg-[#f2a794] shadow-[0_0_8px_rgba(242,167,148,0.8)]" />
                    )}
                    <div className="flex justify-between items-center mb-1 pl-2">
                      <span className={`text-sm font-bold ${m.unread ? "text-[#2d4a36]" : "text-[#2d4a36]/80"}`}>
                        {m.name}
                      </span>
                      <span className="text-[10px] font-bold text-[#8fa797] uppercase tracking-wider">{dateFormatUtils(m.createdAt)}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#2d4a36]/60 pl-2 truncate mb-1">{m.reason || "No subject"}</div>
                    <div className="text-[11px] text-[#2d4a36]/50 pl-2 truncate mb-3 leading-relaxed">
                      {m.msg}
                    </div>
                    {/* <div className="flex gap-1.5 pl-2 flex-wrap">
                      {m.tags.map((t) => <Tag key={t} label={t} />)}
                    </div> */}
                    {m.messageCount > 1 && (
                      <div className="mt-2 pl-2">
                        <span className="text-[10px] text-[#8fa797] font-medium bg-[#F6F4F0] px-2 py-0.5 rounded-full">
                          {m.messageCount} messages
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
               
            </div>
          {totalPages > 1 && (
  <div className="border-t border-[#8fa797]/20 bg-white px-4 py-3">
    <div className="flex items-center justify-between gap-2">

      {/* Previous */}
      <button
        onClick={() => setPage(prev => prev - 1)}
        disabled={page === 1 || loading}
        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
          page === 1 || loading
            ? "text-[#8fa797]/40 border-[#8fa797]/20 cursor-not-allowed"
            : "text-[#2d4a36] border-[#8fa797]/30 hover:bg-[#F6F4F0]"
        }`}
      >
        ←
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            disabled={loading}
            className={`w-8 h-8 rounded-lg text-xs font-bold ${
              page === pageNumber
                ? "bg-[#2d4a36] text-white"
                : "text-[#2d4a36] hover:bg-[#F6F4F0]"
            }`}
          >
            {pageNumber}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => setPage(prev => prev + 1)}
        disabled={page === totalPages || loading}
        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
          page === totalPages || loading
            ? "text-[#8fa797]/40 border-[#8fa797]/20 cursor-not-allowed"
            : "text-[#2d4a36] border-[#8fa797]/30 hover:bg-[#F6F4F0]"
        }`}
      >
        →
      </button>

    </div>

     <div className="text-center mt-1">
      <span className="text-[11px] font-semibold text-[#2d4a36]">
        Showing{" "}
        {Math.min((page - 1) * 5 + 1, totalMessages)}
        -
        {Math.min(page * 5, totalMessages)}
        {" "}of{" "}
        {totalMessages}
      </span>
    </div>
  </div>
)}
          </div>

          {/* Detail pane - Chat Area */}
          <div className="flex-1 bg-[#F6F4F0] flex flex-col overflow-hidden max-h-[600px]">
            {!active ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-[#8fa797]/60">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#8fa797]/40 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium tracking-wide">Select a message to view conversation</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-[#8fa797]/20 px-6 py-4 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#2d4a36]">{active.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`w-2 h-2 rounded-full inline-block shadow-sm ${STATUS_DOT[active.status] || "bg-[#8fa797]"}`} />
                      <span className="text-xs text-[#8fa797]">{active.email}</span>
                      {/* <span className="text-xs text-[#8fa797]/40">•</span>
                      <span className="text-xs text-[#8fa797] capitalize">{active.status}</span> */}
                      {active.topicId && (
                        <>
                          <span className="text-xs text-[#8fa797]/40">•</span>
                          <span className="text-xs text-[#8fa797]">#{active.topicId}</span>
                        </>
                      )}
                      {/* {active.isFromEmail && (
                        <>
                          <span className="text-xs text-[#8fa797]/40">•</span>
                          <span className="text-xs text-[#8fa797]">📧 Email</span>
                        </>
                      )} */}
                    </div>
                  </div>
                  {/* <div className="flex gap-2 flex-wrap">
                    {active.tags.slice(0, 2).map((t) => <Tag key={t} label={t} />)}
                  </div> */}
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                  {active.messages && active.messages.length > 0 ? (
                    <>
                      {active.messages.map((msg, index) => {
                        const timestamp = msg.sentAt ? new Date(msg.sentAt).toLocaleString() : new Date().toLocaleString();
                        
                        return (
                          <div key={msg._id || index} className="mb-6">
                            {/* User Message */}
                            <ChatMessage
                              message={msg.message}
                              isAdmin={false}
                              timestamp={timestamp}
                              isFirst={index === 0}
                              isLast={index === active.messages.length - 1}
                              // source={msg.source}
                            />
                            
                            {/* Admin Replies to this message */}
                            {msg.replies && msg.replies.length > 0 && (
                              <div className="mt-2">
                                {msg.replies.map((reply, idx) => (
                                  <ChatMessage
                                    key={`reply-${msg._id}-${idx}`}
                                    message={reply.message}
                                    isAdmin={true}
                                    timestamp={reply.repliedAt ? new Date(reply.repliedAt).toLocaleString() : new Date().toLocaleString()}
                                    isFirst={false}
                                    isLast={idx === msg.replies.length - 1}
                                  />
                                ))}
                              </div>
                            )}
                            
                            {/* Reply button for this specific message */}
                            {/* <button
                              onClick={() => {
                                setReplyMessageId(msg._id);
                                if (textareaRef.current) {
                                  textareaRef.current.focus();
                                }
                              }}
                              className="ml-12 mt-1 text-xs text-[#8fa797] hover:text-[#2d4a36] font-medium transition-colors"
                            >
                              Reply to this message →
                            </button> */}
                          </div>
                        );
                      })}
                      
                      <div ref={chatEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-[#8fa797]">
                      No messages in this conversation
                    </div>
                  )}
                </div>

                {/* Reply Area */}
                <div className="bg-white border-t border-[#8fa797]/20 p-4 flex-shrink-0">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        ref={textareaRef}
                        className="w-full px-4 py-3 border border-[#8fa797]/40 bg-[#F6F4F0] rounded-xl text-sm text-[#2d4a36] outline-none focus:border-[#2d4a36] focus:ring-4 focus:ring-[#8fa797]/20 resize-none min-h-[60px] max-h-[150px] leading-relaxed transition-all"
                        placeholder={`Reply to ${active?.name || 'client'}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply(active?.id);
                          }
                        }}
                        disabled={sending}
                      />
                    </div>
                   <button
  onClick={() => sendReply(active?.id)}
  disabled={!replyText.trim() || sending}
  className={`self-start mt-2 p-3 rounded-full transition-all flex-shrink-0 ${
    replyText.trim() && !sending
      ? "bg-[#2d4a36] hover:bg-[#8fa797] shadow-lg shadow-[#2d4a36]/20 active:scale-[0.95]"
      : "bg-[#8fa797]/30 cursor-not-allowed"
  }`}
>
  {sending ? (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  ) : (
    <IoSend className="w-5 h-5 text-white" />
  )}
</button>
                  </div>
                  {replyMessageId && (
                    <p className="text-[10px] text-[#8fa797] mt-2">
                      Replying to specific message
                    </p>
                  )}
                </div>
              </>
            )}
          </div>



          
        </div>





        
      </div>


      
    </section>
  );
}