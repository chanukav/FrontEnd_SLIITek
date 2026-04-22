// e2e/helpers/auth.js
// Shared login helper — matches the actual login.jsx selectors exactly.

export async function loginAs(page, options = {}) {
  const email    = options.email    || "it23835078@my.sliit.lk";
  const password = options.password || "Nadun@123";

  await page.goto("/login");

  // Wait for login form to appear
  await page.waitForSelector('input[name="email"]', { timeout: 10_000 });

  // Clear and fill email
  await page.locator('input[name="email"]').clear();
  await page.locator('input[name="email"]').fill(email);

  // Clear and fill password
  await page.locator('input[name="password"]').clear();
  await page.locator('input[name="password"]').fill(password);

  // Submit — button text is "Log In" in login.jsx
  await page.locator('button[type="submit"]').click();

  // Wait for redirect — either /home or away from /login
  // Give extra time for the backend API call to complete
  await page.waitForURL(
    (url) => !url.pathname.includes("/login"),
    { timeout: 20_000 }
  );
}
