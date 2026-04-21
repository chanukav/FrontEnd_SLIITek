const API_URL = "http://localhost:5000/api/reports";

const getAuthHeader = () => {
    try {
        const auth = JSON.parse(localStorage.getItem("auth") || "{}");
        return auth.token ? `Bearer ${auth.token}` : "";
    } catch { return ""; }
};

// Submit a new report (User action)
export const createReport = async (data) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": getAuthHeader()
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || "Failed to create report");
    }
    return res.json();
};

// Get all reports, optionally filtered by status (Moderator action)
export const getReports = async (status = "") => {
    const url = status ? `${API_URL}?status=${status}` : API_URL;
    const res = await fetch(url, {
        headers: { "Authorization": getAuthHeader() }
    });
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
};

// Review a report and apply action (Moderator action)
export const reviewReport = async (id, data) => {
    const res = await fetch(`${API_URL}/${id}/review`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": getAuthHeader()
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error("Server API Error:", errJson);
        throw new Error(errJson.message || errJson.error || "Failed to review report");
    }
    return res.json();
};
