import {
  chromium,
  expect,
  Browser,
  BrowserContext,
  Page
} from "@playwright/test";

// Since we're running as a script, we need to handle the browser launch manually
// mimicking the structure of a test but executing procedurally.

async function run() {
  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page: Page = await context.newPage();

  try {
    // 1. Navigate to the dashboard
    // We assume the dev server is running on localhost:5173 (Vite default)
    // If it's different, we should update it. The user didn't specify port, but standard is 5173.
    await page.goto("http://localhost:5173/dashboard");

    // Check if we need to login
    if (page.url().includes("/login")) {
      console.log("Logging in...");
      await page.fill('input[type="tel"]', "+917002492207");
      await page.fill('input[type="password"]', "Abc123");
      await page.click('button[type="submit"]');
      await page.waitForURL("**/dashboard");
    }

    // 2. Verify Dashboard Layout
    console.log("Verifying Dashboard...");
    await expect(page.locator(".stat-card")).toHaveCount(4);
    await expect(page.locator(".stat-card-label").first()).toHaveText(
      "Total Labourers"
    );

    // 3. Verify Expenses Page & New Amount Field
    console.log("Verifying Expenses...");
    await page.click('a[href="/expenses"]');
    await page.waitForURL("**/expenses");

    // Open Create Modal
    await page.click("text=Create Expense");
    await expect(page.locator('input[name="amount"]')).toBeVisible();

    // Fill form to verify it accepts input
    await page.fill('input[name="title"]', "Test Expense");
    await page.fill('input[name="amount"]', "1000");

    // Close modal
    await page.click("text=Close");

    // 4. Verify Responsive Sidebar (Mobile View)
    console.log("Verifying Mobile Sidebar...");
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    // Sidebar should be hidden initially on mobile
    const sidebar = page.locator(".sidebar");
    await expect(sidebar).not.toHaveClass(/sidebar-open/);

    // Menu button should be visible
    const menuBtn = page.locator(".mobile-menu-button");
    await expect(menuBtn).toBeVisible();

    // Click menu to open sidebar
    await menuBtn.click();
    await expect(sidebar).toHaveClass(/sidebar-open/);

    // Take verification screenshot
    console.log("Taking screenshot...");
    await page.screenshot({
      path: "verification_mobile_open.png",
      fullPage: true
    });

  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
