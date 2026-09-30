import { api } from "../utils/api";

export const getAllTickets = async (search, status, page, limit = 10) => {
  return await api(
    `/api/help/all-tickets?search=${search}&status=${status}&page=${page}&limit=${limit}`
  );
};

export const updateTicketApi = async (ticketId, payload) => {
  return await api(`/api/help/update-ticket/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const getEmailChangeRequests = async () => { 
    return await api("/api/help/email-change-requests");
 };
 
export const approveEmailChangeRequest = async (ticketId) => {
     return await api( `/api/help/approve-email-change/${ticketId}`, { 
        method: "POST", 
    }
 );
 };