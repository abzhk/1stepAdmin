import { api } from "../utils/api.js";

export const getServices = async ({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "order",
  sortOrder = "asc",
}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: search || "",
    sortBy,
    sortOrder,
  });

  return await api(`/api/services/admin/serviceType?${params.toString()}`);
};

export const getOurServices = async ({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "order",
  sortOrder = "asc",
}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: search || "",
    sortBy,
    sortOrder,
  });

  return await api(
    `/api/services/admin/ourServices?${params.toString()}`
  );
};

export const createOurService = async (payload) => {
  return await api("/api/services", {
    method: "POST",
    body: JSON.stringify({
      type: "ourServices",
      ...payload,
    }),
  });
};


export const createService = async (payload) => {
  return await api("/api/services", {
    method: "POST",
    body: JSON.stringify({
      type: "serviceType",
      ...payload,
    }),
  });
};

export const updateService = async (id, payload) => {
  return await api(`/api/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteService = async (id) => {
  return await api(`/api/services/${id}`, {
    method: "DELETE",
  });
};

export const getBillingIntervals = async () => {
  return await api(
    "/api/services/admin/planBillingConfig"
  );
};

export const createBillingInterval = async (payload) => {
  return await api("/api/services", {
    method: "POST",
    body: JSON.stringify({
      type: "planBillingConfig",
      ...payload,
    }),
  });
};