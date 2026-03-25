import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/** Origin for static files (e.g. /uploads) — strip trailing /api from API base */
export const API_ORIGIN = String(API_BASE_URL).replace(/\/api\/?$/, "") || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export { API_BASE_URL };
