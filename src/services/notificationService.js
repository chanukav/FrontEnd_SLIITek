const API_URL = "http://localhost:5000/api/notifications";

/** Read the JWT stored by AuthContext and return Authorization headers */
const getAuthHeaders = () => {
    try {
        const saved = localStorage.getItem("auth");
        const token = saved ? JSON.parse(saved)?.token : null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
};

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

    const url = query.toString() ? `${API_URL}?${query}` : API_URL;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
};

export const getUserNotifications = async (email) => {
    if (!email) throw new Error("Email is required to fetch notifications");
    const res = await fetch(`${API_URL}/user/${encodeURIComponent(email)}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch user notifications");
    return res.json();
};

export const createNotification = async (data) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create notification");
    return res.json();
};

export const markAllAsRead = async (email) => {
    if (!email) throw new Error("Email is required");
    const res = await fetch(`${API_URL}/user/${encodeURIComponent(email)}/read-all`, {
        method: "PUT",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to mark all as read");
    return res.json();
};

export const markAsRead = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to mark as read");
    return res.json();
};

export const markAsUnread = async (id) => {
    const res = await fetch(`${API_URL}/${id}/unread`, {
        method: "PUT",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to mark as unread");
    return res.json();
};

export const deleteNotification = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete notification");
    return res.json();
};
