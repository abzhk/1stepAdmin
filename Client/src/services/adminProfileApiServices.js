import { api } from "../utils/api.js";

export const getAdminProfile = async () => {
  return await api("/api/admin/profile", {
    method: "GET",
  });
};

export const updateAdminProfile = async (payload) => {
  return await api("/api/admin/update-profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};