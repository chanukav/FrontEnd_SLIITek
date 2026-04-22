import { test, expect } from '@playwright/test';

test.describe('Admin Notification E2E', () => {
  test('Admin can send a notification to a specific user and user receives it', async ({ page, browser }) => {
    test.setTimeout(120000); // 2 minutes timeout for the full flow

    const timestamp = Date.now();
    const notificationTitle = `Direct Msg ${timestamp}`;
    const notificationBody = `This is a targeted notification generated at ${timestamp}`;
    const targetEmail = 'it23825314@my.sliit.lk';

    // 1. Admin logs in
    await page.goto('http://localhost:5173/');
    await page.getByRole('navigation').getByRole('button', { name: 'Log in' }).click();
    await page.locator('input[name="email"]').fill('admin@sliitek.com');
    await page.locator('input[name="password"]').fill('Admin@123');
    await page.getByRole('button', { name: 'Log In' }).click();

    // Wait for login to complete and navigate to admin notifications
    await expect(page.locator('a[href="/home"]').or(page.getByText('Home', { exact: true })).first()).toBeVisible({ timeout: 15000 });
    
    // Navigate via UI to Admin Notifications
    await page.getByRole('button', { name: 'S', exact: true }).click();
    await page.getByRole('button', { name: 'Admin Panel' }).click();
    await page.getByRole('link', { name: 'Notifications' }).click();

    // 2. Admin sends the notification
    await page.getByRole('button', { name: 'Broadcast' }).click();
    await page.getByRole('button', { name: 'Specific User' }).click();
    
    // Use the manual input instead of template to ensure unique message
    await page.locator('input#email').fill(targetEmail);
    await page.locator('input#title').fill(notificationTitle);
    await page.locator('textarea#message').fill(notificationBody);

    await page.getByRole('button', { name: 'Send Notification' }).click();
    await page.getByRole('button', { name: 'Send notification', exact: true }).click(); // confirm dialog

    // Verify it was queued successfully
    await expect(page.getByText('Notification queued successfully')).toBeVisible();

    // 3. User logs in with a new browser context
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    await userPage.goto('http://localhost:5173/');
    await userPage.getByRole('navigation').getByRole('button', { name: 'Log in' }).click();
    await userPage.locator('input[name="email"]').fill(targetEmail);
    await userPage.locator('input[name="password"]').fill('Chanuka@123');
    await userPage.getByRole('button', { name: 'Log In' }).click();

    // Wait for home page to load
    await expect(userPage.locator('a[href="/home"]').or(userPage.getByText('Home', { exact: true })).first()).toBeVisible({ timeout: 15000 });

    // 4. User checks notification pane
    // Click the bell icon to open the notifications dropdown
    await userPage.getByRole('button', { name: 'View notifications' }).click();

    // Wait for the specific notification to appear in the dropdown list
    const notificationItem = userPage.getByText(notificationTitle).first();
    await expect(notificationItem).toBeVisible({ timeout: 15000 });
    
    // Optionally check the body text is also there
    await expect(userPage.getByText(notificationBody).first()).toBeVisible();
    
    await userContext.close();
  });
});
