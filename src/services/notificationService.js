import { api } from "../lib/api";

const API_URL = "/notifications";

/**
 * Admin: get all notifications with optional pagination + filters.
 * @param {Object} params - { page, limit, type, isRead, email }
 */
export const getNotifications = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page)   query.set("page",   params.page);
    if (params.limit)  query.set("limit",  params.limit);
    if (params.type && params.type !== 'all')   query.set("type",   params.type);
    if (params.isRead !== undefined && params.isRead !== 'all') query.set("isRead", params.isRead);
    if (params.email)  query.set("email",  params.email);
    if (params.senderEmail) query.set("senderEmail", params.senderEmail);

    const url = query.toString() ? `${API_URL}?${query}` : API_URL;
    const res = await api.get(url);
    return res.data;
};

export const getUserNotifications = async (email) => {
    if (!email) throw new Error("Email is required to fetch notifications");
    const res = await api.get(`${API_URL}/user/${encodeURIComponent(email)}`);
    return res.data;
};

export const createNotification = async (data) => {
    const res = await api.post(API_URL, data);
    return res.data;
};

export const markAllAsRead = async (email) => {
    if (!email) throw new Error("Email is required");
    const res = await api.put(`${API_URL}/user/${encodeURIComponent(email)}/read-all`);
    return res.data;
};

export const markAsRead = async (id) => {
    const res = await api.put(`${API_URL}/${id}`);
    return res.data;
};

export const markAsUnread = async (id) => {
    const res = await api.put(`${API_URL}/${id}/unread`);
    return res.data;
};

export const deleteNotification = async (id) => {
    const res = await api.delete(`${API_URL}/${id}`);
    return res.data;
};
