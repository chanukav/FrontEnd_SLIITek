/**
 * Ten canned notification scenarios for admin QA / demos.
 * Filled via "Apply demo to form" or queued in bulk (requires worker + Redis).
 */

const SAMPLE_QUESTION_ID = "507f1f77bcf86cd799439011";
const SAMPLE_ANSWER_ID = "507f1f77bcf86cd799439012";
const SAMPLE_REPORT_ID = "507f1f77bcf86cd799439013";

/** @typedef {{ email: string, type: string, title: string, message: string, entityType: string, entityId?: string, questionId?: string, answerId?: string }} NotificationCreatePayload */

/**
 * @param {{ staffEmail: string }} opts
 * @returns {{ id: string, label: string, hint: string, payload: NotificationCreatePayload }[]}
 */
export function getAdminDemoNotificationScenarios({ staffEmail }) {
  const direct = (staffEmail || "admin@example.com").trim().toLowerCase();

  return [
    {
      id: "broadcast-maintenance",
      label: "Broadcast · maintenance (announcement)",
      hint: "All users · links to /home",
      payload: {
        email: "all",
        type: "announcement",
        title: "[Demo] Scheduled platform maintenance",
        message:
          "We will deploy updates on Sunday 2–4 AM. Expect brief downtime. This is sample admin content for QA.",
        entityType: "System",
        entityId: "demo-maintenance-round",
      },
    },
    {
      id: "broadcast-community",
      label: "Broadcast · community notice",
      hint: "All users · announcement",
      payload: {
        email: "all",
        type: "announcement",
        title: "[Demo] Community guidelines reminder",
        message:
          "Please keep discussions respectful and cite sources when sharing code. Moderators may remove spam or duplicate posts.",
        entityType: "System",
        entityId: "demo-guidelines-v1",
      },
    },
    {
      id: "broadcast-report-desk",
      label: "Broadcast · moderation desk (report_update)",
      hint: "All users · deep link to /admin/reports for staff",
      payload: {
        email: "all",
        type: "report_update",
        title: "[Demo] Report queue status",
        message:
          "The moderation team is processing reports within 48h. Thank you for helping keep SLIITek safe.",
        entityType: "System",
        entityId: SAMPLE_REPORT_ID,
      },
    },
    {
      id: "direct-new-answer",
      label: "Direct · new answer on your question",
      hint: `To: ${direct} · opens question with #answer anchor`,
      payload: {
        email: direct,
        type: "answer",
        title: "[Demo] New answer on your question",
        message:
          "Someone posted an answer with a code sample and references. Tap through to review and accept if it solves your issue.",
        entityType: "question",
        entityId: SAMPLE_QUESTION_ID,
        questionId: SAMPLE_QUESTION_ID,
        answerId: SAMPLE_ANSWER_ID,
      },
    },
    {
      id: "direct-comment",
      label: "Direct · new comment",
      hint: `To: ${direct} · opens question thread`,
      payload: {
        email: direct,
        type: "comment",
        title: "[Demo] New comment on your thread",
        message:
          "A user replied with a follow-up question about your database indexes. Consider clarifying the ORM version you use.",
        entityType: "question",
        entityId: SAMPLE_QUESTION_ID,
        questionId: SAMPLE_QUESTION_ID,
      },
    },
    {
      id: "direct-best-answer",
      label: "Direct · best answer selected",
      hint: `To: ${direct}`,
      payload: {
        email: direct,
        type: "best_answer",
        title: "[Demo] Your answer was marked best",
        message:
          "The asker accepted your solution. Thanks for contributing clear steps and a minimal reproducible example.",
        entityType: "question",
        entityId: SAMPLE_QUESTION_ID,
        questionId: SAMPLE_QUESTION_ID,
        answerId: SAMPLE_ANSWER_ID,
      },
    },
    {
      id: "direct-report-update",
      label: "Direct · report you filed was updated",
      hint: `To: ${direct} · report_update`,
      payload: {
        email: direct,
        type: "report_update",
        title: "[Demo] Report status: under review",
        message:
          "We are reviewing the content you reported. You will be notified when the ticket is closed or needs more detail.",
        entityType: "Report",
        entityId: SAMPLE_REPORT_ID,
      },
    },
    {
      id: "direct-private-announcement",
      label: "Direct · private staff note (announcement)",
      hint: `To: ${direct} · same schema as broadcast but single inbox`,
      payload: {
        email: direct,
        type: "announcement",
        title: "[Demo] Private: action on your account",
        message:
          "No action required — this is a demo of a directed announcement. In production this might recap a warning or verification step.",
        entityType: "System",
        entityId: "demo-directed-announcement",
      },
    },
    {
      id: "broadcast-comment-style",
      label: "Broadcast · thread activity (comment type)",
      hint: "All users · sample uses question deep link",
      payload: {
        email: "all",
        type: "comment",
        title: "[Demo] Active discussion spotlight",
        message:
          "Several threads had high-quality discussions today. Browse questions to see curated highlights (demo copy).",
        entityType: "question",
        entityId: SAMPLE_QUESTION_ID,
        questionId: SAMPLE_QUESTION_ID,
      },
    },
    {
      id: "direct-external-recipient",
      label: "Direct · another recipient (demo mailbox)",
      hint: "To: demo.recipient@example.com — use for multi-user inbox tests",
      payload: {
        email: "demo.recipient@example.com",
        type: "announcement",
        title: "[Demo] Welcome to SLIITek",
        message:
          "Thanks for joining. Complete your profile and explore the Questions feed. This notification targets a second mailbox for testing.",
        entityType: "System",
        entityId: "demo-onboarding",
      },
    },
  ];
}
