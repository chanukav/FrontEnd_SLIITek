const API_URL = "http://localhost:5000/api/notifications";

export const getNotifications = async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
};

export const createNotification = async (data) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create notification");
    return res.json();
};

export const markAsRead = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to mark as read");
    return res.json();
};

export const markAsUnread = async (id) => {
    const res = await fetch(`${API_URL}/${id}/unread`, {
        method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to mark as unread");
    return res.json();
};

export const deleteNotification = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete notification");
    return res.json();
};
