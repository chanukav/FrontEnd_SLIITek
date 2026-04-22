import { test, expect } from '@playwright/test';

test.describe('Report and Moderation System E2E', () => {
  test('User can report a question and Admin can moderate it', async ({ browser }) => {
    test.setTimeout(120000); // 2 mins timeout for full flow

    const timestamp = Date.now();
    const uniqueTitle = `Test Question ${timestamp}`;
    const reportDetailsText = `Reporting this test question for moderation - ${timestamp}`;

    // 1. Student logs in and asks a question
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    
    await studentPage.goto('http://localhost:5173/');
    await studentPage.getByRole('navigation').getByRole('button', { name: 'Log in' }).click();
    await studentPage.locator('input[name="email"]').fill('it23825314@my.sliit.lk');
    await studentPage.locator('input[name="password"]').fill('Chanuka@123');
    await studentPage.getByRole('button', { name: 'Log In' }).click();
    
    // Wait for login to complete
    await expect(studentPage.locator('a[href="/home"]').or(studentPage.getByText('Home', { exact: true })).first()).toBeVisible({ timeout: 15000 });

    // Ask a question
    await studentPage.goto('http://localhost:5173/questions');
    await studentPage.locator('input#q-title').fill(uniqueTitle);
    await studentPage.locator('textarea#q-body').fill('This is a test question body that will be reported.');
    await studentPage.getByRole('button', { name: 'Post Question' }).click();
    
    // Wait for the new question to appear in the list
    await expect(studentPage.getByText(uniqueTitle).first()).toBeVisible({ timeout: 15000 });
    
    // 2. Admin logs in and reports the question
    // We use Admin so that later we can moderate it from the same user context to save time
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('http://localhost:5173/');
    await adminPage.getByRole('navigation').getByRole('button', { name: 'Log in' }).click();
    await adminPage.locator('input[name="email"]').fill('admin@sliitek.com');
    await adminPage.locator('input[name="password"]').fill('Admin@123');
    await adminPage.getByRole('button', { name: 'Log In' }).click();
    
    // Wait for login to complete
    await expect(adminPage.locator('a[href="/home"]').or(adminPage.getByText('Home', { exact: true })).first()).toBeVisible({ timeout: 15000 });

    // Admin finds and clicks the question
    await adminPage.goto('http://localhost:5173/questions');
    await adminPage.getByText(uniqueTitle).first().click();
    
    // Wait for question details to load
    await expect(adminPage.getByRole('heading', { name: uniqueTitle })).toBeVisible();

    // Report the question
    await adminPage.getByTitle('More').click();
    await adminPage.getByRole('menuitem', { name: 'Report' }).click();
    
    // Fill the report modal
    await expect(adminPage.getByRole('heading', { name: /Report Content/ })).toBeVisible();
    await adminPage.locator('select').selectOption('spam');
    await adminPage.getByPlaceholder(/Provide additional details/i).fill(reportDetailsText);
    await adminPage.getByRole('button', { name: 'Submit Report' }).click();
    
    // Verify success and auto-close (or wait for it to close)
    await expect(adminPage.getByText('Report submitted. Thank you.')).toBeVisible();
    await expect(adminPage.getByRole('heading', { name: /Report Content/ })).not.toBeVisible({ timeout: 10000 });
    
    // 3. Admin goes to Reports Dashboard
    await adminPage.goto('http://localhost:5173/admin/reports');
    
    // Alternatively, just navigate to the URL directly:
    // await adminPage.goto('http://localhost:5173/admin/reports');
    
    // Check if the report exists
    const reportCard = adminPage.locator('.bg-white', { hasText: reportDetailsText }).first();
    await expect(reportCard).toBeVisible({ timeout: 15000 });
    
    // Moderator must click the card to "open context" before Warn User is enabled
    // When clicking the card, it opens a new tab.
    const newPagePromise = adminContext.waitForEvent('page');
    await reportCard.click();
    const contextPage = await newPagePromise;
    await contextPage.close(); // Close the newly opened tab
    
    // Take moderation action (Warn User)
    const warnButton = reportCard.getByRole('button', { name: 'Warn User' });
    await expect(warnButton).toBeEnabled();
    await warnButton.click();
    
    // Confirm modal
    await adminPage.locator('textarea#moderation-context').fill('This is a test warning.');
    await adminPage.getByRole('button', { name: 'Confirm Warn User' }).click();
    
    // Check that report moved to 'reviewed'
    await expect(reportCard.getByText('Reviewed', { exact: true }).first()).toBeVisible({ timeout: 10000 }); // Status updated to reviewed
    
    // Switch to Reviewed tab
    await adminPage.getByRole('button', { name: 'reviewed', exact: true }).click();
    
    // Verify report is visible in the reviewed tab
    const reviewedCard = adminPage.locator('.bg-white', { hasText: reportDetailsText }).first();
    await expect(reviewedCard).toBeVisible({ timeout: 10000 });
    
    // Cleanup contexts
    await studentContext.close();
    await adminContext.close();
  });

  test('Admin can review and remove reported content', async ({ browser }) => {
    test.setTimeout(120000); // 2 mins timeout for full flow

    const timestamp = Date.now();
    const uniqueTitle = `Test Question For Removal ${timestamp}`;
    const reportDetailsText = `Reporting this test question for removal moderation - ${timestamp}`;

    // 1. Student logs in and asks a question
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    
    await studentPage.goto('http://localhost:5173/');
    await studentPage.getByRole('navigation').getByRole('button', { name: 'Log in' }).click();
    await studentPage.locator('input[name="email"]').fill('it23825314@my.sliit.lk');
    await studentPage.locator('input[name="password"]').fill('Chanuka@123');
    await studentPage.getByRole('button', { name: 'Log In' }).click();
    
    // Wait for login to complete
    await expect(studentPage.locator('a[href="/home"]').or(studentPage.getByText('Home', { exact: true })).first()).toBeVisible({ timeout: 15000 });

    // Ask a question
    await studentPage.goto('http://localhost:5173/questions');
    await studentPage.locator('input#q-title').fill(uniqueTitle);
    await studentPage.locator('textarea#q-body').fill('This is a test question body that will be removed by admin.');
    await studentPage.getByRole('button', { name: 'Post Question' }).click();
    
    // Wait for the new question to appear in the list
    await expect(studentPage.getByText(uniqueTitle).first()).toBeVisible({ timeout: 15000 });
    
    // 2. Admin logs in and reports the question
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('http://localhost:5173/');
    await adminPage.getByRole('navigation').getByRole('button', { name: 'Log in' }).click();
    await adminPage.locator('input[name="email"]').fill('admin@sliitek.com');
    await adminPage.locator('input[name="password"]').fill('Admin@123');
    await adminPage.getByRole('button', { name: 'Log In' }).click();
    
    // Wait for login to complete
    await expect(adminPage.locator('a[href="/home"]').or(adminPage.getByText('Home', { exact: true })).first()).toBeVisible({ timeout: 15000 });

    // Admin finds and clicks the question
    await adminPage.goto('http://localhost:5173/questions');
    await adminPage.getByText(uniqueTitle).first().click();
    
    // Wait for question details to load
    await expect(adminPage.getByRole('heading', { name: uniqueTitle })).toBeVisible();

    // Report the question
    await adminPage.getByTitle('More').click();
    await adminPage.getByRole('menuitem', { name: 'Report' }).click();
    
    // Fill the report modal
    await expect(adminPage.getByRole('heading', { name: /Report Content/ })).toBeVisible();
    await adminPage.locator('select').selectOption('spam');
    await adminPage.getByPlaceholder(/Provide additional details/i).fill(reportDetailsText);
    await adminPage.getByRole('button', { name: 'Submit Report' }).click();
    
    // Verify success and auto-close
    await expect(adminPage.getByText('Report submitted. Thank you.')).toBeVisible();
    await expect(adminPage.getByRole('heading', { name: /Report Content/ })).not.toBeVisible({ timeout: 10000 });
    
    // 3. Admin goes to Reports Dashboard
    await adminPage.goto('http://localhost:5173/admin/reports');
    
    // Check if the report exists
    const reportCard = adminPage.locator('.bg-white', { hasText: reportDetailsText }).first();
    await expect(reportCard).toBeVisible({ timeout: 15000 });
    
    // Moderator must click the card to "open context" before action is enabled
    const newPagePromise = adminContext.waitForEvent('page');
    await reportCard.click();
    const contextPage = await newPagePromise;
    await contextPage.close(); // Close the newly opened tab
    
    // Take moderation action (Remove Content)
    const removeButton = reportCard.getByRole('button', { name: 'Remove Content' });
    await expect(removeButton).toBeEnabled();
    await removeButton.click();
    
    // Confirm modal
    await adminPage.locator('textarea#moderation-context').fill('This content has been removed as it violates policy.');
    await adminPage.getByRole('button', { name: 'Confirm Remove Content' }).click();
    
    // Check that report moved to 'reviewed'
    await expect(reportCard.getByText('Reviewed', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    
    // Switch to Reviewed tab
    await adminPage.getByRole('button', { name: 'reviewed', exact: true }).click();
    
    // Verify report is visible in the reviewed tab
    const reviewedCard = adminPage.locator('.bg-white', { hasText: reportDetailsText }).first();
    await expect(reviewedCard).toBeVisible({ timeout: 10000 });

    // 4. Verify Content is actually removed
    // Go to questions list as student and check it's not visible
    await studentPage.goto('http://localhost:5173/questions');
    // Wait a bit for the feed to load
    await studentPage.waitForTimeout(2000);
    await expect(studentPage.getByText(uniqueTitle).first()).not.toBeVisible();
    
    // Cleanup contexts
    await studentContext.close();
    await adminContext.close();
  });
});
