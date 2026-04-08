import React, { useState } from "react";

// 🔷 STATUS BADGE
const StatusBadge = ({ status }) => {
  const styles = {
    Open: "bg-peach text-darkgreen",
    "In Progress": "bg-yellow text-darkgreen",
    Resolved: "bg-greenmuted text-darkgreen",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

// 🔷 IMAGE MODAL
const ImageModal = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <img
        src={src}
        alt="preview"
        className="max-h-[90%] max-w-[90%] rounded-xl shadow-2xl"
      />
    </div>
  );
};

// 🔷 MOCK DATA
const mockTickets = [
  {
    id: "1Step-2026-001",
    name: "Ram",
    email: "ram@gmail.com",
    mobile: "9876543210",
    role: "Provider",
    subject: "Login Issue",
    message: "Unable to login since yesterday.",
    status: "Open",
    date: "10 Apr 2026",
    attachment: "https://via.placeholder.com/600",
  },
  {
    id: "1Step-2026-002",
    name: "Mary",
    email: "mary@gmail.com",
    mobile: "9123456780",
    role: "Parent",
    subject: "Payment Failed",
    message: "Payment is not going through.",
    status: "In Progress",
    date: "09 Apr 2026",
    attachment: null,
  },
  {
    id: "1Step-2026-003",
    name: "Alex",
    email: "alex@gmail.com",
    mobile: "9000012345",
    role: "Center",
    subject: "Account Locked",
    message: "Account locked issue.",
    status: "Resolved",
    date: "08 Apr 2026",
    attachment: null,
  },
  {
    id: "1Step-2026-004",
    name: "Priya",
    email: "priya@gmail.com",
    mobile: "9870011223",
    role: "Provider",
    subject: "App Crash",
    message: "Application crashes when opening dashboard.",
    status: "Open",
    date: "07 Apr 2026",
    attachment: "https://via.placeholder.com/600",
  },
  {
    id: "1Step-2026-005",
    name: "Rahul",
    email: "rahul@gmail.com",
    mobile: "9988776655",
    role: "Parent",
    subject: "Subscription Issue",
    message: "Subscription not updated after payment.",
    status: "In Progress",
    date: "06 Apr 2026",
    attachment: null,
  },
];

// MAIN COMPONENT
export default function Helpdesk() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState("All");

  const filteredTickets =
    filter === "All"
      ? mockTickets
      : mockTickets.filter((t) => t.status === filter);

  return (
    <div className="p-6 bg-offwhite min-h-screen">

      {!selectedTicket ? (
        <>
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-darkgreen">Helpdesk</h1>
           
          </div>

          {/* FILTER */}
          <div className="flex gap-3 mb-6">
            {["All", "Open", "In Progress", "Resolved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === tab
                    ? "bg-darkgreen text-white shadow"
                    : "bg-white border border-greenmuted/30"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TICKET GRID */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition cursor-pointer border border-greenmuted/20 p-5"
              >
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-darkgreen text-white flex items-center justify-center font-semibold">
                      {ticket.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-darkgreen text-sm">
                        {ticket.name}
                      </p>
                      <p className="text-xs text-gray-500">{ticket.role}</p>
                    </div>
                  </div>
<div className="mt-0">
                  <StatusBadge status={ticket.status} />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-medium text-darkgreen">
                    {ticket.subject}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {ticket.message}
                  </p>
                </div>

                {ticket.attachment && (
                  <img
                    src={ticket.attachment}
                    className="mt-3 w-full h-32 object-cover rounded-xl"
                  />
                )}

                <div className="flex justify-between mt-4 text-xs">
                  <span className="text-darkgreen font-medium">
                    {ticket.id}
                  </span>
                  <span className="text-gray-500">{ticket.date}</span>
                </div>
              </div>
            ))}
          </div>

        </>
      ) : (
        <TicketDetails
          ticket={selectedTicket}
          goBack={() => setSelectedTicket(null)}
        />
      )}

    </div>
  );
}

//  DETAILS PAGE
const TicketDetails = ({ ticket, goBack }) => {
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [previewImg, setPreviewImg] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!reply.trim()) return;
    setSent(true);
    setReply("");
  };

  return (
    <div>
      <button onClick={goBack} className="mb-4 text-darkgreen">
        ← Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">

        {/*  USER CARD */}
        <div className="bg-white rounded-3xl shadow-lg border border-greenmuted/20 overflow-hidden">

          {/* HEADER */}
          <div className="bg-darkgreen p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white text-darkgreen flex items-center justify-center text-xl font-bold shadow">
                {ticket.name.charAt(0)}
              </div>

              <div>
                <p className="text-white text-lg font-semibold">{ticket.name}</p>
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                  {ticket.role}
                </span>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-softpeach opacity-20 rounded-full blur-2xl"></div>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-4">

            {[
              { label: "Email", value: ticket.email },
              { label: "Mobile", value: ticket.mobile },
              { label: "Ticket ID", value: ticket.id },
              { label: "Date", value: ticket.date },
            ].map((item) => (
              <div key={item.label} className="bg-offwhite p-3 rounded-xl flex justify-between">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-darkgreen truncate max-w-[140px]">
                  {item.value}
                </span>
              </div>
            ))}

            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <StatusBadge status={status} />
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-6 rounded-3xl shadow md:col-span-2 border border-greenmuted/20">

          <h3 className="text-lg font-semibold text-darkgreen">
            {ticket.subject}
          </h3>

          <p className="mt-2 text-gray-600">
            {ticket.message}
          </p>

          {ticket.attachment && (
            <img
              src={ticket.attachment}
              onClick={() => setPreviewImg(ticket.attachment)}
              className="mt-4 max-w-md rounded-xl cursor-pointer"
            />
          )}

          <ImageModal src={previewImg} onClose={() => setPreviewImg(null)} />

          {/* REPLY */}
          <div className="mt-6">
            <h4 className="font-semibold mb-2 text-darkgreen">Reply</h4>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full border rounded-xl p-3 h-32"
              placeholder="Type your response..."
            />

            <div className="flex justify-between items-center mt-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-2 rounded-xl"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>

              <button
                onClick={handleSend}
                className="bg-darkgreen hover:bg-greenmuted text-white px-5 py-2 rounded-xl"
              >
                Send Reply
              </button>
            </div>

            {sent && (
              <p className="text-green-600 text-sm mt-2">
                Reply sent
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};