import { api } from "../utils/api.js";

export const getParents = async ({
  page = 1,
  limit = 12,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const params = new URLSearchParams({
    limit: String(limit),
    startIndex: String((page - 1) * limit),
    sort: sortBy,
    order: sortOrder,
  });

  if (search?.trim()) {
    params.append("searchTerm", search.trim());
  }

  return await api(
    `/api/parent/getallparents?${params.toString()}`
  );
};


export const getParentById = async (userId) => {
  return await api(`/api/parent/getparent/${userId}`);
};

export const getParentStats = async (userId) => {
  return await api(`/api/parent/parent/${userId}/stats`);
};

// Get parent bookings
export const getParentBookings = async (userId) => {
  return await api(`/api/parent/bookings/${userId}`, {
    method: "GET",
    credentials: "include",
  });
};

// Get inactive parents
export const getInactiveParents = async () => {
  return await api("/api/parent/inactive-parents");
};

// Delete parent
export const deleteParent = async (userId) => {
  return await api(`/api/admin/parent/user/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

export const activateParent = async (userId) => {
  return await api("/api/parent/admin/parent/status", {
    method: "PUT",
    body: JSON.stringify({
      userId,
      isActive: true,
    }),
  });
};

// Update parent
export const updateParent = async (userId, payload) => {
  return await api(`/api/admin/parent/user/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};