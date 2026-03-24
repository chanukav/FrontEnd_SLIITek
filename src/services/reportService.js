const API_URL = "http://localhost:5000/api/reports";

// Submit a new report (User action)
export const createReport = async (data) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create report");
    return res.json();
};

// Get all reports, optionally filtered by status (Moderator action)
export const getReports = async (status = "") => {
    const url = status ? `${API_URL}?status=${status}` : API_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
};

// Review a report and apply action (Moderator action)
// data example: { status: "reviewed", action: "removed", reviewedBy: "mod123" }
export const reviewReport = async (id, data) => {
    const res = await fetch(`${API_URL}/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to review report");
    return res.json();
};
