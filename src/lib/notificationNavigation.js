/**
 * Resolves an in-app path for a notification document from the API.
 * Backend fields: type, entityType, entityId, optional questionId, answerId.
 *
 * @param {object | null | undefined} notif
 * @returns {string | null}
 */
export function getNotificationTargetPath(notif) {
  if (!notif) return null;

  const type = String(notif.type || "").toLowerCase();
  const entityType = String(notif.entityType || "").toLowerCase();
  const entityId = notif.entityId;

  const questionId =
    notif.questionId || (entityType === "question" ? entityId : null);

  if (notif.answerId && questionId) {
    return `/questions/${questionId}#answer-${notif.answerId}`;
  }

  if (notif.questionId) return `/questions/${notif.questionId}`;

  if (entityType === "question" && entityId) return `/questions/${entityId}`;

  if (type === "announcement") return "/home";
  if (type === "report_update") return "/admin/reports";

  return null;
}
