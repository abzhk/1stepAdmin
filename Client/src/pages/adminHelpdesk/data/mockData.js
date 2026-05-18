export const INITIAL_TICKETS = [
  { id: "TKT-2041", user: "Aruna Sharma", initials: "AS", email: "aruna.s@example.com", title: "Session scheduling conflict", cat: "Booking", priority: "Medium", status: "In progress", agent: "Raj Kumar", created: "Apr 20, 2025 · 9:41 AM", messages: 3 },
  { id: "TKT-2040", user: "Priya Menon", initials: "PM", email: "priya.m@example.com", title: "Payment not reflecting in account", cat: "Billing", priority: "High", status: "Open", agent: null, created: "Apr 20, 2025 · 8:22 AM", messages: 1 },
  { id: "TKT-2039", user: "Karan Desai", initials: "KD", email: "karan.d@example.com", title: "Unable to log into portal", cat: "Account", priority: "High", status: "Open", agent: null, created: "Apr 19, 2025 · 6:10 PM", messages: 2 },
  { id: "TKT-2038", user: "Meena Rajan", initials: "MR", email: "meena.r@example.com", title: "Wrong invoice amount charged", cat: "Billing", priority: "High", status: "In progress", agent: "Divya Lakshmi", created: "Apr 19, 2025 · 3:44 PM", messages: 5 },
  { id: "TKT-2037", user: "Suresh Pillai", initials: "SP", email: "suresh.p@example.com", title: "App crashes on session start", cat: "Technical", priority: "Medium", status: "In progress", agent: "Raj Kumar", created: "Apr 18, 2025 · 11:02 AM", messages: 4 },
  { id: "TKT-2036", user: "Latha Krishnan", initials: "LK", email: "latha.k@example.com", title: "How to add a second child profile?", cat: "General", priority: "Low", status: "Resolved", agent: "Divya Lakshmi", created: "Apr 18, 2025 · 9:15 AM", messages: 2 },
  { id: "TKT-2035", user: "Vijay Nair", initials: "VN", email: "vijay.n@example.com", title: "Video call quality issues on mobile", cat: "Technical", priority: "Medium", status: "Resolved", agent: "Anand P.", created: "Apr 17, 2025 · 4:30 PM", messages: 6 },
  { id: "TKT-2034", user: "Deepa Chandran", initials: "DC", email: "deepa.c@example.com", title: "Duplicate booking created", cat: "Booking", priority: "Low", status: "Resolved", agent: "Divya Lakshmi", created: "Apr 17, 2025 · 2:11 PM", messages: 3 },
  { id: "TKT-2033", user: "Ramesh Iyer", initials: "RI", email: "ramesh.i@example.com", title: "Cannot download session report", cat: "Technical", priority: "Low", status: "Closed", agent: "Neha S.", created: "Apr 16, 2025 · 10:00 AM", messages: 2 },
  { id: "TKT-2032", user: "Anitha Bose", initials: "AB", email: "anitha.b@example.com", title: "Refund not processed after cancellation", cat: "Billing", priority: "High", status: "Open", agent: null, created: "Apr 16, 2025 · 8:45 AM", messages: 1 },
];

export const AGENTS = [
  { name: "Raj Kumar", initials: "RK", role: "Tier 2 Support", open: 4, resolved: 23, status: "online", color: "sage" },
  { name: "Divya Lakshmi", initials: "DL", role: "Tier 1 Support", open: 3, resolved: 31, status: "online", color: "green" },
  { name: "Anand P.", initials: "AP", role: "Technical Specialist", open: 2, resolved: 17, status: "away", color: "yellow" },
  { name: "Neha S.", initials: "NS", role: "Tier 1 Support", open: 5, resolved: 12, status: "online", color: "peach" },
];

export const AVATAR_PALETTE = [
  "bg-[#8fa797]/20 text-[#2d4a36]", 
  "bg-[#ffd333]/30 text-[#2d4a36]", 
  "bg-[#f2a794]/20 text-[#2d4a36]",
  "bg-[#F6F4F0] border border-[#8fa797]/30 text-[#2d4a36]", 
  "bg-[#2d4a36] text-[#F6F4F0]",
];

export const AGENT_COLOR_MAP = { 
  sage: "bg-[#8fa797]/20 text-[#2d4a36]", 
  green: "bg-[#2d4a36] text-[#F6F4F0]", 
  yellow: "bg-[#ffd333]/30 text-[#2d4a36]", 
  peach: "bg-[#f2a794]/20 text-[#2d4a36]" 
};

export const ac = (i) => AVATAR_PALETTE[i % AVATAR_PALETTE.length];