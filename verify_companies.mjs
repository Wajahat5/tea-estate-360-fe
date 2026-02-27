import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the login page
    await page.goto('http://localhost:5173');

    // Wait for the login form to appear
    await page.waitForSelector('input[type="text"]', { timeout: 30000 });

    // Fill in the login form - Inputs don't have name attributes, so selecting by type/order
    // First input is text (phone), second is password
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
        await inputs[0].fill('+917002492207');
        await inputs[1].fill('Abc123');
    } else {
        throw new Error("Login inputs not found");
    }

    // Click the login button
    await page.click('button.primary-button');

    // Wait for navigation to the dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });

    // Navigate to Companies page
    await page.goto('http://localhost:5173/companies');

    // Wait for companies to load
    await page.waitForSelector('.company-card', { timeout: 10000 });

    // Take a screenshot of the Companies page with the new card design
    await page.screenshot({ path: 'companies_page_verification.png', fullPage: true });

    console.log('Screenshot taken: companies_page_verification.png');

    // Also expand a garden accordion if possible to verify that
    const accordionToggle = await page.$('.accordion-toggle');
    if (accordionToggle) {
        await accordionToggle.click();
        // Wait for animation
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'companies_page_expanded.png', fullPage: true });
        console.log('Screenshot taken: companies_page_expanded.png');
    } else {
        console.log('No accordion toggle found - maybe no gardens in mock data?');
    }

  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: 'error_state_4.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
