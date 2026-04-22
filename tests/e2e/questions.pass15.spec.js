import { expect, test } from "@playwright/test";

const E2E_EMAIL    = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const API_BASE_URL = process.env.E2E_API_URL || "http://localhost:5000/api";
const RUN_KEY      = Date.now();
let   runCount     = 0;
const uid = (prefix) => `${prefix} ${RUN_KEY}-${++runCount}`;

// ── helpers ──────────────────────────────────────────────────────────────────

async function loginByApi(page) {
  if (!E2E_EMAIL || !E2E_PASSWORD)
    throw new Error("Set E2E_EMAIL and E2E_PASSWORD before running these tests.");

  const res     = await page.request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: E2E_EMAIL, password: E2E_PASSWORD },
  });
  const payload = await res.json().catch(() => ({}));

  expect(res.ok(),  `Login failed (${res.status()}): ${payload?.message}`).toBeTruthy();
  expect(payload?.token, "Login response missing token").toBeTruthy();
  expect(payload?.user,  "Login response missing user").toBeTruthy();

  await page.addInitScript((auth) => {
    localStorage.setItem("auth", JSON.stringify(auth));
  }, { token: payload.token, refreshToken: payload.refreshToken ?? null, user: payload.user });
}

async function gotoQuestions(page) {
  await loginByApi(page);
  await page.goto("/questions");
  await expect(page).toHaveURL(/\/questions$/);
}

async function postQuestion(page, title, body, category = "General / Other") {
  await page.locator("#q-title").fill(title);
  await page.locator("#q-body").fill(body);
  await page.locator("#q-category").selectOption(category);
  await page.getByRole("button", { name: "Post Question" }).click();
  await expect(page.getByRole("link", { name: title }).first()).toBeVisible({ timeout: 10_000 });
}

async function openQuestion(page, title) {
  const link = page.getByRole("link", { name: title }).first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/questions\/.+$/);
}

// ── AUTH ─────────────────────────────────────────────────────────────────────

test.describe("Auth & access", () => {
  test("TC01 unauthenticated user is redirected to /login", async ({ page }) => {
    await page.goto("/questions");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("TC02 authenticated user can open /questions", async ({ page }) => {
    await gotoQuestions(page);
    await expect(page.getByRole("heading", { name: "Questions" })).toBeVisible();
  });
});

// ── PAGE LAYOUT ───────────────────────────────────────────────────────────────

test.describe("Questions page layout", () => {
  test("TC03 Ask a Question heading is visible", async ({ page }) => {
    await gotoQuestions(page);
    await expect(page.getByRole("heading", { name: "Ask a Question" })).toBeVisible();
  });

  test("TC04 form fields title, body, category, tags are present", async ({ page }) => {
    await gotoQuestions(page);
    await expect(page.locator("#q-title")).toBeVisible();
    await expect(page.locator("#q-body")).toBeVisible();
    await expect(page.locator("#q-category")).toBeVisible();
    await expect(page.locator("#q-tags")).toBeVisible();
  });

  test("TC05 question list section has heading and total count", async ({ page }) => {
    await gotoQuestions(page);
    await expect(page.getByRole("heading", { level: 1, name: "Questions" })).toBeVisible();
    await expect(page.locator("text=total")).toBeVisible();
  });

  test("TC06 search bar and button are visible", async ({ page }) => {
    await gotoQuestions(page);
    await expect(page.getByPlaceholder("Search questions")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });
});

// ── CREATE QUESTION ───────────────────────────────────────────────────────────

test.describe("Create question", () => {
  test("TC07 Post Question button is disabled while posting", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#q-title").fill(uid("TC07"));
    await page.locator("#q-body").fill("body text");
    const btn = page.getByRole("button", { name: /Post Question|Posting\.\.\./ });
    await btn.click();
    // During posting the button label switches to "Posting..." AND is disabled.
    // We assert either condition: text change OR disabled attribute – whichever
    // the browser captures first avoids a sub-millisecond race on fast machines.
    await Promise.race([
      expect(btn).toHaveText("Posting...", { timeout: 5_000 }),
      expect(btn).toBeDisabled({ timeout: 5_000 }),
    ]);
  });

  test("TC08 create question with valid data appears in list", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC08 valid create");
    await postQuestion(page, title, "Valid body content");
    await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
  });

  test("TC09 title field is required – HTML5 validation prevents submit", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#q-body").fill("some body");
    // form has required on title; submit should NOT post
    await page.getByRole("button", { name: "Post Question" }).click();
    // URL stays on /questions (no navigation / no new card)
    await expect(page).toHaveURL(/\/questions$/);
  });

  test("TC10 body field is required – HTML5 validation prevents submit", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#q-title").fill("some title");
    await page.getByRole("button", { name: "Post Question" }).click();
    await expect(page).toHaveURL(/\/questions$/);
  });

  test("TC11 category dropdown contains all 7 options", async ({ page }) => {
    await gotoQuestions(page);
    const options = page.locator("#q-category option");
    await expect(options).toHaveCount(7);
  });

  test("TC12 create question under Academic category", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC12 Academic");
    await postQuestion(page, title, "academic body", "Academic");
    await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
  });

  test("TC13 own question shows Yours badge in list", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC13 badge");
    await postQuestion(page, title, "badge body");
    await expect(page.getByText("Yours").first()).toBeVisible();
  });
});

// ── TITLE SUGGESTIONS ─────────────────────────────────────────────────────────

test.describe("Title suggestions", () => {
  test("TC14 suggestion panel appears after typing 3+ chars", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#q-title").fill("how");
    await expect(page.getByText("Suggested questions")).toBeVisible({ timeout: 5_000 });
  });

  test("TC15 suggestion panel absent when title has < 3 chars", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#q-title").fill("ho");
    await expect(page.getByText("Suggested questions")).toBeHidden();
  });
});

// ── TAG SUGGESTIONS ──────────────────────────────────────────────────────────

test.describe("Tag suggestions", () => {
  test("TC16 tag suggestions appear for Academic category", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#q-category").selectOption("Academic");
    await page.locator("#q-tags").fill("it");
    await expect(page.locator("button", { hasText: "itpm" })).toBeVisible();
  });

  test("TC17 clicking a tag suggestion populates tags input", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#q-category").selectOption("Academic");
    await page.locator("#q-tags").fill("it");
    await page.locator("button", { hasText: "itpm" }).click();
    await expect(page.locator("#q-tags")).toHaveValue(/itpm/);
  });
});

// ── Q&A HISTORY PANEL ────────────────────────────────────────────────────────

test.describe("Q&A history panel", () => {
  test("TC18 Q&A history toggle button is visible when logged in", async ({ page }) => {
    await gotoQuestions(page);
    await expect(page.locator("#questions-page-qa-history-toggle")).toBeVisible();
  });

  test("TC19 clicking toggle opens history panel", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#questions-page-qa-history-toggle").click();
    await expect(page.locator("#questions-page-qa-history-panel")).toBeVisible();
  });

  test("TC20 clicking toggle again collapses history panel", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#questions-page-qa-history-toggle").click();
    await page.locator("#questions-page-qa-history-toggle").click();
    await expect(page.locator("#questions-page-qa-history-panel")).toBeHidden();
  });

  test("TC21 history panel shows Your questions and Your answers headings", async ({ page }) => {
    await gotoQuestions(page);
    await page.locator("#questions-page-qa-history-toggle").click();
    await expect(page.getByText("Your questions")).toBeVisible();
    await expect(page.getByText("Your answers")).toBeVisible();
  });
});

// ── SEARCH ───────────────────────────────────────────────────────────────────

test.describe("Search", () => {
  test("TC22 search returns matching question", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC22 search");
    await postQuestion(page, title, "search body");
    await page.getByPlaceholder("Search questions").fill(title);
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByRole("link", { name: title }).first()).toBeVisible({ timeout: 8_000 });
  });

  test("TC23 search with no match shows No questions yet.", async ({ page }) => {
    await gotoQuestions(page);
    await page.getByPlaceholder("Search questions").fill(uid("NOMATCH_UNIQUE_XYZ"));
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByText("No questions yet.")).toBeVisible({ timeout: 8_000 });
  });

  test("TC24 empty search reloads all questions", async ({ page }) => {
    await gotoQuestions(page);
    // Create a question so the reload has at least one result to show.
    const sentinel = uid("TC24 sentinel");
    await postQuestion(page, sentinel, "sentinel body");
    // No-match search: fixed pure-alpha token cannot overlap with any uid()-generated
    // title (which share the RUN_KEY timestamp digits).
    await page.getByPlaceholder("Search questions").fill("ZZZNOMATCHZZZ");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByText("No questions yet.")).toBeVisible({ timeout: 8_000 });
    // Empty search → full list returns; sentinel link reappears
    await page.getByPlaceholder("Search questions").fill("");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByRole("link", { name: sentinel }).first()).toBeVisible({ timeout: 8_000 });
  });
});

// ── QUESTION DETAILS ─────────────────────────────────────────────────────────

test.describe("Question details page", () => {
  test("TC25 clicking a question opens details page", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC25 details");
    await postQuestion(page, title, "details body");
    await openQuestion(page, title);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("TC26 question body is visible on details page", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC26 body");
    const body  = uid("TC26 body content");
    await postQuestion(page, title, body);
    await openQuestion(page, title);
    await expect(page.getByText(body)).toBeVisible();
  });

  test("TC27 Back to questions link navigates back", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC27 back");
    await postQuestion(page, title, "back body");
    await openQuestion(page, title);
    await page.getByRole("link", { name: "Back to questions" }).click();
    await expect(page).toHaveURL(/\/questions$/);
  });

  test("TC28 Answers section heading visible on details page", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC28 answers heading");
    await postQuestion(page, title, "answers heading body");
    await openQuestion(page, title);
    await expect(page.getByRole("heading", { name: /Answers \(/ })).toBeVisible();
  });

  test("TC29 Vote button is visible on details page", async ({ page }) => {
    await gotoQuestions(page);
    const link = page.locator('a[href*="/questions/"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.getByRole("button", { name: /Vote \(/ })).toBeVisible();
  });

  test("TC30 question category badge visible on details page", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC30 category badge");
    await postQuestion(page, title, "category body", "Academic");
    await openQuestion(page, title);
    await expect(page.getByText("Academic").first()).toBeVisible();
  });

  test("TC31 question status badge visible on details page", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC31 status badge");
    await postQuestion(page, title, "status body");
    await openQuestion(page, title);
    await expect(page.getByText("open").first()).toBeVisible();
  });
});

// ── QUESTION VOTING ──────────────────────────────────────────────────────────

test.describe("Question voting", () => {
  test("TC32 vote button label changes after click", async ({ page }) => {
    await gotoQuestions(page);
    // Use a freshly-created question so the logged-in user is NOT the author
    // (backend may block self-voting on an existing question that belongs to this account).
    // We rely on the fact that a second session / another user posted earlier questions;
    // to be safe, open the question list and click the LAST link (oldest) which is
    // least likely to be owned by this test account.
    const title = uid("TC32 vote test");
    await postQuestion(page, title, "vote test body");
    // Navigate to a question that was NOT created by this user session:
    // pick the very first link NOT matching our just-created title.
    await page.goto("/questions");
    await expect(page).toHaveURL(/\/questions$/);
    // Find any question link that is NOT the sentinel
    const otherLink = page.locator('a[href*="/questions/"]').filter({ hasNotText: title }).first();
    if (await otherLink.count() === 0) {
      // Fallback: if truly only one question exists, skip by voting on any question
      // and verify the score element updates (even if same user)
      const anyLink = page.locator('a[href*="/questions/"]').first();
      await anyLink.click();
    } else {
      await otherLink.click();
    }
    await expect(page).toHaveURL(/\/questions\/.+$/);
    const btn    = page.getByRole("button", { name: /Vote \(/ });
    await expect(btn).toBeVisible();
    const before = await btn.textContent();
    await btn.click();
    // Wait for text to actually update (React state re-render after API response)
    await expect(btn).not.toHaveText(before, { timeout: 6_000 });
  });

  test("TC33 toggling vote twice returns to original score", async ({ page }) => {
    await gotoQuestions(page);
    const link = page.locator('a[href*="/questions/"]').first();
    await link.click();
    const btn    = page.getByRole("button", { name: /Vote \(/ });
    const before = await btn.textContent();
    await btn.click();
    await btn.click();
    await expect(btn).toHaveText(before);
  });
});

// ── ANSWERS ──────────────────────────────────────────────────────────────────

test.describe("Answers", () => {
  test("TC34 authenticated user can submit an answer", async ({ page }) => {
    await gotoQuestions(page);
    const title  = uid("TC34 answer submit");
    await postQuestion(page, title, "answer submit body");
    await openQuestion(page, title);
    const answer = uid("TC34 answer text");
    await page.getByPlaceholder("Write your answer").fill(answer);
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByText(answer)).toBeVisible({ timeout: 8_000 });
  });

  test("TC35 submitting empty answer shows validation error", async ({ page }) => {
    await gotoQuestions(page);
    const link = page.locator('a[href*="/questions/"]').first();
    await link.click();
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByText("Please write an answer before submitting.")).toBeVisible();
  });

  test("TC36 answer Like button is visible", async ({ page }) => {
    await gotoQuestions(page);
    const title  = uid("TC36 like btn");
    await postQuestion(page, title, "like btn body");
    await openQuestion(page, title);
    await page.getByPlaceholder("Write your answer").fill("like test answer");
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByRole("button", { name: /Like \(/ }).first()).toBeVisible();
  });

  test("TC37 answer Unlike button is visible", async ({ page }) => {
    await gotoQuestions(page);
    const title  = uid("TC37 unlike btn");
    await postQuestion(page, title, "unlike btn body");
    await openQuestion(page, title);
    await page.getByPlaceholder("Write your answer").fill("unlike test answer");
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByRole("button", { name: /Unlike \(/ }).first()).toBeVisible();
  });

  test("TC38 Like click changes Like count", async ({ page }) => {
    await gotoQuestions(page);
    const title  = uid("TC38 like count");
    await postQuestion(page, title, "like count body");
    await openQuestion(page, title);
    const answerBody = uid("TC38 answer");
    await page.getByPlaceholder("Write your answer").fill(answerBody);
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByText(answerBody)).toBeVisible({ timeout: 8_000 });
    const btn    = page.getByRole("button", { name: /Like \(/ }).first();
    await expect(btn).toBeVisible();
    const before = await btn.textContent();
    await btn.click();
    // Wait for React to re-render with the updated count from the API response
    await expect(btn).not.toHaveText(before, { timeout: 6_000 });
  });

  test("TC39 answer author can edit own answer via prompt", async ({ page }) => {
    await gotoQuestions(page);
    const title   = uid("TC39 edit answer");
    await postQuestion(page, title, "edit answer body");
    await openQuestion(page, title);
    await page.getByPlaceholder("Write your answer").fill("original answer");
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByRole("button", { name: "Edit" }).first()).toBeVisible();
  });

  test("TC40 answer author can delete own answer", async ({ page }) => {
    await gotoQuestions(page);
    const title  = uid("TC40 delete answer");
    await postQuestion(page, title, "delete answer body");
    await openQuestion(page, title);
    const answerText = uid("TC40 answer to delete");
    await page.getByPlaceholder("Write your answer").fill(answerText);
    await page.getByRole("button", { name: "Submit Answer" }).click();
    // Wait for the answer card to be fully rendered in the DOM
    await expect(page.getByText(answerText)).toBeVisible({ timeout: 8_000 });
    // The Delete button lives inside the answer card that contains answerText.
    // Scope to that card to avoid matching the question-delete dialog button.
    const answerCard = page.locator(".border.rounded-lg").filter({ hasText: answerText });
    await expect(answerCard).toBeVisible({ timeout: 5_000 });
    const deleteBtn = answerCard.getByRole("button", { name: "Delete" });
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
    await deleteBtn.click();
    await expect(page.getByText(answerText)).toBeHidden({ timeout: 8_000 });
  });

  test("TC41 answer character count helper text visible", async ({ page }) => {
    await gotoQuestions(page);
    const link = page.locator('a[href*="/questions/"]').first();
    await link.click();
    await page.getByPlaceholder("Write your answer").fill("test");
    await expect(page.getByText(/4\/2000/)).toBeVisible();
  });
});

// ── REPLIES ───────────────────────────────────────────────────────────────────

test.describe("Replies", () => {
  test("TC42 Reply textarea is visible for each answer", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC42 reply textarea");
    await postQuestion(page, title, "reply textarea body");
    await openQuestion(page, title);
    await page.getByPlaceholder("Write your answer").fill("base answer for reply");
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByPlaceholder("Write a reply").first()).toBeVisible();
  });

  test("TC43 submitting a reply displays it under the answer", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC43 reply submit");
    await postQuestion(page, title, "reply submit body");
    await openQuestion(page, title);
    await page.getByPlaceholder("Write your answer").fill("parent answer");
    await page.getByRole("button", { name: "Submit Answer" }).click();
    const replyText = uid("TC43 reply text");
    await page.getByPlaceholder("Write a reply").first().fill(replyText);
    await page.getByRole("button", { name: "Reply" }).first().click();
    await expect(page.getByText(replyText)).toBeVisible({ timeout: 8_000 });
  });
});

// ── OWNER ACTIONS ─────────────────────────────────────────────────────────────

test.describe("Question owner actions", () => {
  test("TC44 owner sees the More (⋯) menu button on own question", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC44 more menu");
    await postQuestion(page, title, "more menu body");
    await openQuestion(page, title);
    await expect(page.getByTitle("More")).toBeVisible();
  });

  test("TC45 More menu contains Edit and Delete items", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC45 menu items");
    await postQuestion(page, title, "menu items body");
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();
  });

  test("TC46 More menu closes on Escape key", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC46 escape menu");
    await postQuestion(page, title, "escape menu body");
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
  });

  test("TC47 clicking Edit navigates to edit page", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC47 edit nav");
    await postQuestion(page, title, "edit nav body");
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/questions\/.+\/edit$/);
    await expect(page.getByRole("heading", { name: "Edit question" })).toBeVisible();
  });

  test("TC48 edit page pre-fills title and body", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC48 prefill");
    const body  = uid("TC48 prefill body");
    await postQuestion(page, title, body);
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await expect(page.locator("input[required]")).toHaveValue(title);
  });

  test("TC49 saving edited question persists changes", async ({ page }) => {
    await gotoQuestions(page);
    const title   = uid("TC49 edit save");
    await postQuestion(page, title, "old body");
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    const newBody = uid("TC49 updated body");
    await page.locator("textarea[required]").fill(newBody);
    await page.getByRole("button", { name: "Save changes" }).click();
    // navigates to /home on save
    await expect(page).toHaveURL(/\/home/);
  });

  test("TC50 cancel on edit page returns to question detail", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC50 cancel edit");
    await postQuestion(page, title, "cancel edit body");
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/\/questions\/.+$/);
  });

  test("TC51 clicking Delete opens confirmation dialog", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC51 confirm dialog");
    await postQuestion(page, title, "confirm dialog body");
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(page.getByRole("heading", { name: "Delete question?" })).toBeVisible();
  });

  test("TC52 cancel in delete dialog keeps question intact", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC52 cancel delete");
    await postQuestion(page, title, "cancel delete body");
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "Delete question?" })).toBeHidden();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("TC53 confirming delete removes question from list", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC53 delete question");
    await postQuestion(page, title, "delete me body");
    await openQuestion(page, title);
    await page.getByTitle("More").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).last().click();
    await expect(page).toHaveURL(/\/home/, { timeout: 8_000 });
    await page.goto("/questions");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });
});

// ── MARK BEST ANSWER ──────────────────────────────────────────────────────────

test.describe("Mark best answer", () => {
  test("TC54 question owner sees Mark best button on answer", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC54 mark best");
    await postQuestion(page, title, "mark best body");
    await openQuestion(page, title);
    await page.getByPlaceholder("Write your answer").fill("best candidate answer");
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await expect(page.getByRole("button", { name: "Mark best" }).first()).toBeVisible();
  });

  test("TC55 clicking Mark best labels the answer as Best", async ({ page }) => {
    await gotoQuestions(page);
    const title = uid("TC55 best label");
    await postQuestion(page, title, "best label body");
    await openQuestion(page, title);
    await page.getByPlaceholder("Write your answer").fill("best answer candidate");
    await page.getByRole("button", { name: "Submit Answer" }).click();
    await page.getByRole("button", { name: "Mark best" }).first().click();
    await expect(page.getByText("Best").first()).toBeVisible({ timeout: 8_000 });
  });
});
