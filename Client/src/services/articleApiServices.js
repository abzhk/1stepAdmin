import { api } from "../utils/api";

export const getAllArticles = async (params) => {
  const query = new URLSearchParams(params);
  return await api(`/api/article/all?${query}`);
};

export const toggleFeatured = async (id) => {
  return await api(`/api/article/featured/${id}`, {
    method: "PUT",
  });
};

export const deleteArticle = async (id) => {
  return await api(`/api/article/admin/delete/${id}`, {
    method: "DELETE",
  });
};

export const getPendingArticles = async (page, search) => {
  const params = new URLSearchParams({
    page,
    limit: 20,
  });

  if (search) {
    params.append("search", search);
  }

  return await api(`/api/article/pendingarticle?${params}`);
};

export const approveArticle = async (articleId) => {
  return await api(`/api/article/admin/${articleId}/approve`, {
    method: "PUT",
  });
};

export const rejectArticle = async (articleId, reason) => {
  return await api(`/api/article/admin/${articleId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
};


export const getArticleTags = async () => {
  return await api("/api/services/articleTag?format=raw");
};

export const getActiveCategories = async () => {
  return await api("/api/category/active");
};

export const createArticle = async (payload) => {
  return await api("/api/article/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateArticle = async (id, payload) => {
  return await api(`/api/article/admin/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const getArticleById = async (id) => {
  return await api(`/api/article/${id}`);
};