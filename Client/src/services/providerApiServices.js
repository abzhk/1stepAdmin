// providerApiService.js
import { api } from "../utils/api.js";


export const getProviders = async ({
  page = 1,
  limit = 12,
  search = "",
  providerType = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const params = new URLSearchParams({
    limit: String(limit),
    startIndex: String((page - 1) * limit),
    sort: sortBy,
    order: sortOrder,
  });

  if (providerType?.trim()) {
    params.append("providerType", providerType.trim());
  }

  if (search?.trim()) {
    params.append("searchTerm", search.trim());
  }

  return await api(
    `/api/provider/admin-individual-list?${params.toString()}`
  );
};

export const updateProviderStatus = async (providerId, isActive) => {
  return await api(`/api/provider/admin/provider/status`, {
    method: "PUT",
    body: JSON.stringify({
      providerId,
      isActive,
    }),
  });
};



export const getProviderStats = async (providerId, { month, year }) => {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });

  return await api(
    `/api/provider/getallbooking/${providerId}?${params.toString()}`
  );
};

export const getProviderById = async (providerId) => {
  return await api(`/api/provider/providersbyid/${providerId}`);
};

export const getProviderBookings = async (
  providerId,
  { page, limit, status }
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
  });

  return await api(
    `/api/booking/getbookingbyprovider/${providerId}?${params.toString()}`
  );
};

export const getProviderArticles = async (
  providerId,
  { limit, startIndex }
) => {
  const params = new URLSearchParams({
    limit: String(limit),
    startIndex: String(startIndex),
  });

  return await api(
    `/api/article/providerarticle/${providerId}?${params.toString()}`
  );
};

export const getProviderAssessments = async (
  providerId,
  { limit, startIndex }
) => {
  const params = new URLSearchParams({
    limit: String(limit),
    startIndex: String(startIndex),
  });

  return await api(
    `/api/assessment/getassessment/${providerId}?${params.toString()}`
  );
};

export const getInactiveProviders = async () => {
  return await api(`/api/provider/inactive-providers`);
};


export const deleteProvider = async (providerId) => {
  return await api(`/api/admin/providers/${providerId}`, {
    method: "DELETE",
  });
};

export const getTherapyOptions = async () => {
  return await api("/api/services/serviceMode");
};

