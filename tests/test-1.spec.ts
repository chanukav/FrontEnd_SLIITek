import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('navigation').getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('textbox', { name: 'it85757874@my.sliit.lk' }).click();
  await page.getByRole('textbox', { name: 'it85757874@my.sliit.lk' }).fill('admin@sliitek.com');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('Admin@123');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.locator('#ask-question-btn').click();
  await page.getByRole('button', { name: 'S', exact: true }).click();
  await page.getByRole('button', { name: 'Admin Panel' }).click();
  await page.getByRole('link', { name: 'Notifications' }).click();
  await page.getByRole('button', { name: 'Queue demo set (10)' }).click();
  
  // 1. Verify that the notifications were successfully added to the Redis Queue
  await expect(page.getByText(/Queued \d+ demo notifications/)).toBeVisible({ timeout: 10000 });
  
  // 2. Open the notification dropdown/panel
  await page.getByRole('button', { name: 'View notifications' }).click();
  
  // 3. Wait up to 15 seconds for the Notification Worker to process the Redis queue
  // and push the real-time notification to the frontend via Server-Sent Events (SSE)
  const demoNotification = page.getByText('[Demo] Active discussion').first();
  await expect(demoNotification).toBeVisible({ timeout: 15000 });
  
  // 4. Click the real-time notification to ensure it's actionable
  await demoNotification.click();
});