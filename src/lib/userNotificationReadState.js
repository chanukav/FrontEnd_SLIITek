/**
 * Mirrors backend inbox mapping for isRead (staff senders use readBy; broadcasts use readBy per viewer).
 */

export function isStaffSentNotification(notif) {
  const s = notif?.senderEmail;
  return typeof s === "string" && s.trim().length > 0;
}

export function normalizeNotificationForViewer(notif, viewerEmail) {
  const email = String(viewerEmail || "").toLowerCase();
  const n = { ...notif };
  if (n.email === "all") {
    n.isRead =
      Array.isArray(n.readBy) &&
      n.readBy.some((e) => String(e).toLowerCase() === email);
  } else if (isStaffSentNotification(n)) {
    const inReadBy =
      Array.isArray(n.readBy) &&
      n.readBy.some((e) => String(e).toLowerCase() === email);
    const legacyRead =
      String(n.email || "").toLowerCase() === email && n.isRead === true;
    n.isRead = inReadBy || legacyRead;
  }
  return n;
}

export function mapNotificationsForViewer(list, viewerEmail) {
  return (list || []).map((n) => normalizeNotificationForViewer(n, viewerEmail));
}
