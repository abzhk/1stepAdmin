const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined");
}

export const api = async (endpoint, options = {}) => {
  try {
    const isFormData = options.body instanceof FormData;
    const hasBody = options.body !== undefined && options.body !== null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",

      headers: {
        // A JSON Content-Type on a body-less GET makes this cross-origin
        // request non-simple, so browsers send an extra OPTIONS preflight.
        ...(hasBody && !isFormData
          ? {
              "Content-Type": "application/json",
            }
          : {}),

        ...(options.headers || {}),
      },

      ...options,
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
};
