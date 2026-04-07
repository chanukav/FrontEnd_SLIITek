import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/** Origin for static files (e.g. /uploads) — strip trailing /api from API base */
export const API_ORIGIN = String(API_BASE_URL).replace(/\/api\/?$/, "") || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("auth") || "{}");
  } catch {
    return {};
  }
};

const setStoredToken = (token) => {
  const auth = getStoredAuth();
  localStorage.setItem(
    "auth",
    JSON.stringify({
      ...auth,
      token,
    })
  );
};

const clearStoredAuth = () => {
  localStorage.removeItem("auth");
};

// Use a separate client for refresh to avoid interceptor loops.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error?.config;
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    const shouldAttemptRefresh =
      (status === 401 &&
        (message === "Token verification failed" || message === "Not authorized")) ||
      (status === 403 && message === "Token verification failed");

    if (!originalConfig || originalConfig._retry || !shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    try {
      if (!refreshPromise) {
        const storedRefresh = getStoredAuth().refreshToken;
        refreshPromise = refreshClient
          .post(
            "/auth/refresh-token",
            storedRefresh ? { refreshToken: storedRefresh } : {}
          )
          .then((res) => res.data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const data = await refreshPromise;
      const newToken = data?.token;
      if (!newToken) throw new Error("No token returned from refresh");

      setStoredToken(newToken);

      originalConfig.headers = {
        ...(originalConfig.headers || {}),
        Authorization: `Bearer ${newToken}`,
      };

      return api(originalConfig);
    } catch (refreshError) {
      clearStoredAuth();
      return Promise.reject(refreshError);
    }
  }
);

export { API_BASE_URL };
