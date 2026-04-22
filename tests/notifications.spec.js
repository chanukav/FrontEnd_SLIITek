import { test, expect } from '@playwright/test';

// Common mock data
const mockNotifications = [
  {
    _id: "notif_1",
    email: "user@example.com",
    type: "announcement",
    title: "System Update",
    message: "The system will be going down for maintenance.",
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: "notif_2",
    email: "user@example.com",
    type: "answer",
    title: "New Answer",
    message: "Someone answered your question.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

test.describe('Notification System - User Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user login state in localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('auth', JSON.stringify({
        token: 'fake-user-token',
        user: { _id: '1', email: 'user@example.com', role: 'user', name: 'Test User' }
      }));
    });

    // Mock the getUserNotifications API call
    await page.route('**/api/notifications/user/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, count: 2, data: mockNotifications })
      });
    });

    // Go to user notifications page (update URL based on actual routing)
    await page.goto('/dashboard/user?tab=notifications');
  });

  test('should display notifications list with unread counts', async ({ page }) => {
    // Check if "Notifications" title exists
    await expect(page.locator('text=Notifications').first()).toBeVisible();

    // Check unread count badge
    await expect(page.locator('text=1 new')).toBeVisible();

    // Check if notification titles are rendered
    await expect(page.locator('text=System Update')).toBeVisible();
    await expect(page.locator('text=New Answer')).toBeVisible();
  });

  test('should filter by All and Unread tabs', async ({ page }) => {
    // Click Unread tab
    await page.click('button:has-text("Unread")');
    await expect(page.locator('text=System Update')).toBeVisible();
    await expect(page.locator('text=New Answer')).not.toBeVisible();

    // Click All tab
    await page.click('button:has-text("All")');
    await expect(page.locator('text=System Update')).toBeVisible();
    await expect(page.locator('text=New Answer')).toBeVisible();
  });

  test('should mark a notification as read', async ({ page }) => {
    // Mock the mark as read API
    await page.route('**/api/notifications/notif_1', async route => {
      if (route.request().method() === 'PUT') {
        const updatedNotif = { ...mockNotifications[0], isRead: true };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: updatedNotif })
        });
      } else {
        await route.continue();
      }
    });

    // Click "Mark as read" button for the first notification
    await page.click('button[title="Mark as read"]');

    // Button should change to "Mark as unread"
    // Expect 2 mark as read buttons now
    await expect(page.locator('button[title="Mark as unread"]')).toHaveCount(2);
  });

  test('should mark a notification as unread', async ({ page }) => {
    // Mock the mark as unread API
    await page.route('**/api/notifications/notif_2/unread', async route => {
      if (route.request().method() === 'PUT') {
        const updatedNotif = { ...mockNotifications[1], isRead: false };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: updatedNotif })
        });
      } else {
        await route.continue();
      }
    });

    // Click mark as unread on the read notification
    await page.click('button[title="Mark as unread"]');

    // Expect 2 mark as read buttons now
    await expect(page.locator('button[title="Mark as read"]')).toHaveCount(2);
  });

  test('should mark all notifications as read', async ({ page }) => {
    await page.route('**/api/notifications/user/*/read-all', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'All marked as read' })
      });
    });

    // UI re-fetches user notifications after marking all as read, mock that fetch
    await page.route('**/api/notifications/user/*', async route => {
      const allRead = mockNotifications.map(n => ({ ...n, isRead: true }));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, count: 2, data: allRead })
      });
    });

    await page.click('button:has-text("Mark all read")');

    // Unread count should disappear
    await expect(page.locator('text=1 new')).not.toBeVisible();
    await expect(page.locator('button[title="Mark as read"]')).not.toBeVisible();
  });

  test('should delete a notification', async ({ page }) => {
    // Mock delete API
    await page.route('**/api/notifications/notif_1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      } else {
        await route.continue();
      }
    });

    // Click delete button for first notification
    await page.locator('button[title="Delete"]').first().click();

    // Click confirm in dialog
    await page.click('button:has-text("Delete")');

    // Notification should be removed from the list
    await expect(page.locator('text=System Update')).not.toBeVisible();
  });
});

test.describe('Notification System - Admin Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin login state in localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('auth', JSON.stringify({
        token: 'fake-admin-token',
        user: { _id: '2', email: 'admin@example.com', role: 'admin', name: 'Test Admin' }
      }));
    });

    // Mock Get All notifications for "Sent by me"
    await page.route('**/api/notifications*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            total: 1,
            pages: 1,
            data: [{
              _id: "sent_1",
              senderEmail: "admin@example.com",
              email: "all",
              type: "announcement",
              title: "Global Announce",
              message: "Sent by me test",
              isRead: false,
              createdAt: new Date().toISOString()
            }]
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin/notifications');
  });

  test('should toggle between Inbox and Sent by Me tabs', async ({ page }) => {
    await expect(page.locator('text=Notifications Hub')).toBeVisible();

    await page.click('button:has-text("Sent by Me")');
    await expect(page.locator('text=Global Announce')).toBeVisible();
  });

  test('should validate the broadcast form before sending', async ({ page }) => {
    await page.click('button:has-text("Broadcast")');

    // Submit empty form
    await page.click('button:has-text("Send Notification")');

    // Validation errors should appear
    await expect(page.locator('text=Target User Email')).toBeVisible();
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Message body is required')).toBeVisible();
  });

  test('should successfully send a broadcast notification', async ({ page }) => {
    await page.click('button:has-text("Broadcast")');

    // Select Broadcast (All) audience
    await page.click('button:has-text("Broadcast (All)")');

    // Fill the form
    await page.fill('input[placeholder="e.g. System Maintenance"]', 'Test Broadcast');
    await page.fill('textarea[placeholder="What do you want to tell your users?"]', 'This is a test message that is long enough.');

    // Click Send Notification
    await page.click('button:has-text("Send Notification")');

    // Confirm dialog should appear
    await expect(page.locator('text=Send this notification?')).toBeVisible();

    // Mock Create notification POST API
    await page.route('**/api/notifications', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 202,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: "Notification queued successfully" })
        });
      } else {
        await route.continue();
      }
    });

    // Confirm sending
    await page.getByRole('button', { name: 'Send notification', exact: true }).click();

    // Toast success
    await expect(page.locator('text=Notification queued successfully')).toBeVisible();
  });

  test('should edit a sent notification', async ({ page }) => {
    await page.click('button:has-text("Sent by Me")');

    // Find the edit button 
    await page.click('button:has-text("Edit")');

    // Edit dialog should appear
    await expect(page.locator('text=Edit sent notification')).toBeVisible();

    await page.locator('input[value="Global Announce"]').fill('Updated Title');

    await page.route('**/api/notifications/sent_1', async route => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} })
        });
      } else {
        await route.continue();
      }
    });

    await page.click('button:has-text("Save changes")');

    await expect(page.locator('text=Notification updated')).toBeVisible();
  });
});


