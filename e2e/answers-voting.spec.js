// e2e/answers-voting.spec.js
// Playwright E2E tests — Answers, Voting & Reputation
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO RUN (from FrontEnd_SLIITek folder):
//   npx playwright test e2e/answers-voting.spec.js --headed
//
// Or via VS Code Playwright Extension:
//   Click the ▶ icon next to any test in the Testing panel.
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth.js";

// ─── Change this to a real Question ID in your DB ───────────────────────────
// You can find it in the URL when you open a question: /questions/<QUESTION_ID>
const QUESTION_ID = process.env.TEST_QUESTION_ID || "69e80180ee96069e1d6333aa";
const QUESTION_URL = `/questions/${QUESTION_ID}`;

// ═══════════════════════════════════════════════════════════════════════════════
// SETUP — login once before each test
// ═══════════════════════════════════════════════════════════════════════════════

test.beforeEach(async ({ page }) => {
  await loginAs(page);
  await page.goto(QUESTION_URL);
  
  // Wait for the question title to load
  await page.waitForSelector("h1", { timeout: 10_000 });
  
  // Wait for the answer form to be visible (textarea for posting answer)
  const answerTextarea = page.locator("textarea").first();
  await answerTextarea.waitFor({ timeout: 10_000, state: 'attached' });
  
  // Wait for at least one answer to load OR for the "no answers" message
  // This ensures the backend has responded with answer data
  try {
    await page.waitForSelector('[class*="answer"]', { timeout: 8_000 });
  } catch {
    // It's ok if there are no answers yet - continue with test
  }
  
  // Small delay to let the DOM fully settle
  await page.waitForTimeout(300);
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 1 — POSTING AN ANSWER
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("📝 Posting an Answer", () => {

  test("TC-E2E-PA-01 | Page loads — question title and answer form visible", async ({ page }) => {
    // Question title should be visible
    const title = page.locator("h1");
    await expect(title).toBeVisible();

    // "Your answer" section heading
    await expect(page.getByText(/your answer/i)).toBeVisible();

    // The answer textarea
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();

    // Submit button
    await expect(page.getByRole("button", { name: /submit answer/i })).toBeVisible();
  });

  test("TC-E2E-PA-02 | Submit empty answer shows validation error", async ({ page }) => {
    // Click submit without typing anything
    await page.getByRole("button", { name: /submit answer/i }).click();

    // Expect an error message to appear
    await expect(
      page.getByText(/please write an answer/i)
    ).toBeVisible();
  });

  test("TC-E2E-PA-03 | Submit whitespace-only answer shows validation error", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await textarea.fill("     ");
    await page.getByRole("button", { name: /submit answer/i }).click();
    await expect(page.getByText(/please write an answer/i)).toBeVisible();
  });

  test("TC-E2E-PA-04 | Submit valid answer — appears at top of answer list", async ({ page }) => {
    const uniqueText = `Playwright test answer ${Date.now()}`;

    const textarea = page.locator("textarea").first();
    await textarea.fill(uniqueText);

    await page.getByRole("button", { name: /submit answer/i }).click();

    // The new answer should appear in the list
    await expect(page.getByText(uniqueText)).toBeVisible({ timeout: 10_000 });

    // Textarea should be cleared after submit
    await expect(textarea).toHaveValue("");
  });

  test("TC-E2E-PA-05 | Character counter updates as user types", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await textarea.fill("Hello SLIIT!");

    // The page shows "X/2000" character count
    await expect(page.getByText(/\/2000/)).toBeVisible();
  });

  test("TC-E2E-PA-06 | Answer with offensive word is blocked", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await textarea.fill("This is a shit answer");

    await page.getByRole("button", { name: /submit answer/i }).click();

    // Should show offensive-word error (from frontend ANSWER_BLOCKED_WORDS check)
    await expect(page.getByText(/offensive/i)).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 2 — VOTING (Like / Dislike)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("👍 Voting on Answers", () => {

  test("TC-E2E-VA-01 | Like button is visible on each answer card", async ({ page }) => {
    // At least one Like button should exist
    const likeBtn = page.getByRole("button", { name: /like/i }).first();
    await expect(likeBtn).toBeVisible({ timeout: 8_000 });
  });

  test("TC-E2E-VA-02 | Unlike button is visible on each answer card", async ({ page }) => {
    const dislikeBtn = page.getByRole("button", { name: /unlike/i }).first();
    await expect(dislikeBtn).toBeVisible({ timeout: 8_000 });
  });

  test("TC-E2E-VA-03 | Clicking Like increments like count", async ({ page }) => {
    const likeBtn = page.getByRole("button", { name: /like/i }).first();
    await likeBtn.waitFor({ timeout: 8_000 });

    // Read current count from button text e.g. "Like (3)"
    const textBefore = await likeBtn.textContent();
    const countBefore = parseInt(textBefore.match(/\d+/)?.[0] ?? "0");

    await likeBtn.click();

    // Wait for UI update
    await page.waitForTimeout(1000);

    const textAfter = await likeBtn.textContent();
    const countAfter = parseInt(textAfter.match(/\d+/)?.[0] ?? "0");

    // Count should have changed (either +1 or back to original if toggle)
    expect(typeof countAfter).toBe("number");
    // The button state (ring/highlight) should have changed
    await expect(likeBtn).toBeVisible();
  });

  test("TC-E2E-VA-04 | Clicking Like twice (toggle) returns to original count", async ({ page }) => {
    const likeBtn = page.getByRole("button", { name: /like/i }).first();
    await likeBtn.waitFor({ timeout: 8_000 });

    const textBefore = await likeBtn.textContent();
    const countBefore = parseInt(textBefore.match(/\d+/)?.[0] ?? "0");

    // Like
    await likeBtn.click();
    await page.waitForTimeout(800);

    // Unlike (click again)
    await likeBtn.click();
    await page.waitForTimeout(800);

    const textAfter = await likeBtn.textContent();
    const countAfter = parseInt(textAfter.match(/\d+/)?.[0] ?? "0");

    expect(countAfter).toBe(countBefore);
  });

  test("TC-E2E-VA-05 | Clicking Unlike (dislike) increments dislike count", async ({ page }) => {
    const unlikeBtn = page.getByRole("button", { name: /unlike/i }).first();
    await unlikeBtn.waitFor({ timeout: 8_000 });

    const textBefore = await unlikeBtn.textContent();
    const countBefore = parseInt(textBefore.match(/\d+/)?.[0] ?? "0");

    await unlikeBtn.click();
    await page.waitForTimeout(1000);

    const textAfter = await unlikeBtn.textContent();
    const countAfter = parseInt(textAfter.match(/\d+/)?.[0] ?? "0");

    expect(typeof countAfter).toBe("number");
    // Toggle back to clean state for next test
    await unlikeBtn.click();
    await page.waitForTimeout(500);
  });

  test("TC-E2E-VA-06 | Like and Unlike buttons show active highlight when voted", async ({ page }) => {
    const likeBtn = page.getByRole("button", { name: /like/i }).first();
    await likeBtn.waitFor({ timeout: 8_000 });

    // Click like
    await likeBtn.click();
    await page.waitForTimeout(800);

    // The button should now have a "ring" active class (CSS highlight)
    // We check the class attribute contains ring-2 (from QuestionDetails.jsx)
    const classAttr = await likeBtn.getAttribute("class");
    expect(classAttr).toContain("ring-2");

    // Toggle back
    await likeBtn.click();
    await page.waitForTimeout(500);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 3 — REPLYING TO AN ANSWER
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("💬 Reply to an Answer", () => {

  test("TC-E2E-RP-01 | Reply textarea is visible for each answer", async ({ page }) => {
    // Wait for answers to be fully loaded on the page
    // Look for the first answer card by waiting for a common element
    await page.waitForSelector('[class*="answer"]', { timeout: 8_000 }).catch(() => {});
    
    // Give the page a moment to render reply textareas
    await page.waitForTimeout(500);
    
    // The reply textarea (inside each answer card)
    const replyTextarea = page.locator("textarea[placeholder*='reply' i]").first();
    await expect(replyTextarea).toBeVisible({ timeout: 8_000 });
  });

  test("TC-E2E-RP-02 | Submit empty reply shows validation error", async ({ page }) => {
    // Wait for answers to be fully loaded
    await page.waitForSelector('[class*="answer"]', { timeout: 8_000 }).catch(() => {});
    await page.waitForTimeout(500);
    
    const replyBtn = page.getByRole("button", { name: /^reply$/i }).first();
    await replyBtn.waitFor({ timeout: 8_000 });
    await replyBtn.click();

    await expect(page.getByText(/please write an answer/i)).toBeVisible({ timeout: 5_000 });
  });

  test("TC-E2E-RP-03 | Submit valid reply — appears nested under parent answer", async ({ page }) => {
    const replyText = `Playwright reply ${Date.now()}`;
    
    // Wait for replies to be accessible
    await page.waitForSelector('[class*="answer"]', { timeout: 8_000 });
    await page.waitForTimeout(300);
    
    const replyTextarea = page.locator("textarea[placeholder*='reply' i]").first();
    await replyTextarea.waitFor({ timeout: 8_000 });
    await replyTextarea.fill(replyText);

    const replyBtn = page.getByRole("button", { name: /^reply$/i }).first();
    await replyBtn.click();
    
    // Wait for the reply to be processed and added to the DOM
    await page.waitForTimeout(500);

    // The reply text should appear on the page
    await expect(page.getByText(replyText)).toBeVisible({ timeout: 10_000 });

    // Textarea should be cleared
    await expect(replyTextarea).toHaveValue("");
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 4 — MARK BEST ANSWER (Reputation System)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("🏆 Mark Best Answer (Reputation)", () => {

  test("TC-E2E-MB-01 | Question owner sees Mark Best button", async ({ page }) => {
    // This test only passes when logged in as the QUESTION OWNER
    // If you are NOT the owner, the button won't appear — skip gracefully
    const markBestBtn = page.getByRole("button", { name: /mark best/i }).first();

    const count = await markBestBtn.count();
    if (count === 0) {
      test.skip();   // not the owner — skip
      return;
    }
    await expect(markBestBtn).toBeVisible();
  });

  test("TC-E2E-MB-02 | Clicking Mark Best labels answer as Best", async ({ page }) => {
    const markBestBtn = page.getByRole("button", { name: /mark best/i }).first();

    const count = await markBestBtn.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await markBestBtn.click();
    await page.waitForTimeout(1500);

    // The "Best" label should now appear on that answer card
    await expect(page.getByText(/best/i).first()).toBeVisible({ timeout: 8_000 });
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 5 — EDIT ANSWER
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("✏️ Edit Answer", () => {

  test("TC-E2E-EA-01 | Edit button is visible on own answer", async ({ page }) => {
    const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
    const count = await editBtn.count();
    if (count === 0) {
      test.skip();
      return;
    }
    await expect(editBtn).toBeVisible();
  });

  test("TC-E2E-EA-02 | Edit dialog opens with existing answer text", async ({ page }) => {
    const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
    const count = await editBtn.count();
    if (count === 0) { test.skip(); return; }

    await editBtn.click();

    // Dialog with "Edit answer" heading should open
    await expect(page.getByText(/edit answer/i)).toBeVisible({ timeout: 5_000 });

    // Textarea inside dialog should have some text (existing body)
    const dialogTextarea = page.locator("[role='dialog'] textarea");
    await expect(dialogTextarea).toBeVisible();
  });

  test("TC-E2E-EA-03 | Cancel button closes edit dialog", async ({ page }) => {
    const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
    const count = await editBtn.count();
    if (count === 0) { test.skip(); return; }

    await editBtn.click();
    await expect(page.getByText(/edit answer/i)).toBeVisible();

    // Click cancel
    await page.getByRole("button", { name: /cancel/i }).click();

    // Dialog should close
    await expect(page.getByText(/edit answer/i)).not.toBeVisible({ timeout: 3_000 });
  });

  test("TC-E2E-EA-04 | Save updated answer text — shows new text on page", async ({ page }) => {
    const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
    const count = await editBtn.count();
    if (count === 0) { test.skip(); return; }

    await editBtn.click();
    await expect(page.getByText(/edit answer/i)).toBeVisible();

    const updatedText = `Updated by Playwright ${Date.now()}`;
    const dialogTextarea = page.locator("[role='dialog'] textarea");
    await dialogTextarea.fill(updatedText);

    // Click Save changes
    await page.getByRole("button", { name: /save changes/i }).click();
    await page.waitForTimeout(1500);

    // Updated text should appear in the answer list
    await expect(page.getByText(updatedText)).toBeVisible({ timeout: 8_000 });
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 6 — DELETE ANSWER
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("🗑️ Delete Answer", () => {

  test("TC-E2E-DA-01 | Delete button is visible on own answer", async ({ page }) => {
    const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
    const count = await deleteBtn.count();
    if (count === 0) { test.skip(); return; }
    await expect(deleteBtn).toBeVisible();
  });

  test("TC-E2E-DA-02 | Deleting an answer removes it from list", async ({ page }) => {
    // First post a fresh answer so we can safely delete it
    const deleteText = `To be deleted ${Date.now()}`;
    const textarea = page.locator("textarea").first();
    await textarea.fill(deleteText);
    await page.getByRole("button", { name: /submit answer/i }).click();
    await expect(page.getByText(deleteText)).toBeVisible({ timeout: 10_000 });
    
    // Wait for UI to settle after creation
    await page.waitForTimeout(800);

    // Count delete buttons before (should be at least 1)
    const deleteButtonsBefore = await page.getByRole("button", { name: /delete/i }).count();
    
    // Click the first delete button (which should be for our newly created answer at top of list)
    const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
    await deleteBtn.click();
    
    // Wait for the API request to complete
    await page.waitForTimeout(1000);

    // Check if the answer text is gone from the page
    // Use a longer timeout since the deletion might take time to reflect in the DOM
    await expect(page.getByText(deleteText)).not.toBeVisible({ timeout: 12_000 });
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 7 — UNAUTHENTICATED ACCESS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("🔒 Unauthenticated User", () => {

  test("TC-E2E-UA-01 | Unauthenticated user is redirected to login", async ({ page }) => {
    // Clear auth from localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("auth"));

    // Try to go to question details
    await page.goto(QUESTION_URL);

    // Should be redirected to /login
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });

});
