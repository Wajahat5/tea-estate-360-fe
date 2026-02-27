
import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720} # Desktop view
        )
        page = await context.new_page()

        try:
            # Login (Mock)
            await page.goto("http://localhost:5173/login")

            if page.url.endswith("/login"):
                await page.fill('input[type="text"]', "+917002492207")
                await page.fill('input[type="password"]', "Abc123")
                await page.click('button[type="submit"]')
                await page.wait_for_url("http://localhost:5173/dashboard", timeout=20000)

            print("Logged in successfully.")

            # Navigate to Expenses Page
            await page.click('a[href="/expenses"]')
            await page.wait_for_selector("h1.page-title", state="visible")

            print("Navigated to Expenses page.")

            # --- Fill Filter Form ---
            # Wait for form
            await page.wait_for_selector("form.request-filters-form", state="visible")

            # Select Garden
            await page.select_option('select.field-input', index=1)

            # Fill Dates - Using specific index or label context if possible
            # The inputs are siblings.
            # From: 2nd child of label
            # To: 2nd child of label

            # Let's find inputs by type="date"
            date_inputs = page.locator('input[type="date"]')
            await date_inputs.nth(0).fill("2024-02-01")
            await date_inputs.nth(1).fill("2024-02-28")

            # Click Submit
            await page.click('button:has-text("Submit")')

            # --- Check Amount Column ---
            # Wait for table to load
            await page.wait_for_selector("table.table", state="visible")

            # Check for "Amount" header
            headers_locator = page.locator("table.table thead tr th")
            headers_count = await headers_locator.count()
            headers = []
            for i in range(headers_count):
                headers.append(await headers_locator.nth(i).inner_text())

            if "Amount" in headers:
                print("SUCCESS: 'Amount' column header found.")
            else:
                print("FAILURE: 'Amount' column header NOT found.")

            # Verify rows have amount data
            first_row_cells = page.locator("table.table tbody tr:first-child td")
            amount_cell = first_row_cells.nth(5)
            amount_text = await amount_cell.inner_text()
            print(f"First row Amount: {amount_text}")

            await page.screenshot(path="verification_expenses_desktop.png")

            # --- Check Create Expense Form ---
            # Click Create Expense button
            await page.click("button:has-text('Create Expense')")
            await page.wait_for_selector(".modal-card", state="visible")

            # Check for Amount input
            amount_input = page.locator('input[name="amount"]')
            if await amount_input.is_visible():
                print("SUCCESS: Amount input field found in Create Expense form.")
            else:
                print("FAILURE: Amount input field NOT found in Create Expense form.")

            await page.screenshot(path="verification_create_expense_form.png")

            # Close modal
            await page.click("button:has-text('Close')")

            # --- Check Mobile Responsiveness ---
            print("Checking Mobile Responsiveness...")
            # Resize viewport to mobile
            await page.set_viewport_size({"width": 375, "height": 667})
            await page.wait_for_timeout(1000) # Wait for resize

            # Check if Sidebar is hidden (off-screen)
            sidebar = page.locator("aside.sidebar")
            # In our CSS, sidebar is fixed and translated -100% on mobile by default.
            # We can check if overlay is hidden.
            overlay = page.locator(".sidebar-overlay")
            if not await overlay.is_visible():
                 print("SUCCESS: Sidebar overlay is hidden initially on mobile.")
            else:
                 print("FAILURE: Sidebar overlay is visible initially on mobile.")

            # Check menu button visibility
            menu_btn = page.locator("button.mobile-menu-button")
            if await menu_btn.is_visible():
                print("SUCCESS: Mobile menu button is visible.")
            else:
                print("FAILURE: Mobile menu button is NOT visible.")

            await page.screenshot(path="verification_mobile_closed.png")

            # Open Sidebar
            await menu_btn.click()
            await page.wait_for_timeout(500) # Wait for transition

            # Sidebar should be open (class 'sidebar-open')
            is_open = await sidebar.evaluate("el => el.classList.contains('sidebar-open')")
            if is_open:
                print("SUCCESS: Sidebar opened (has 'sidebar-open' class).")
            else:
                print("FAILURE: Sidebar did NOT open (missing 'sidebar-open' class).")

            await page.screenshot(path="verification_mobile_open.png")

            # Close sidebar by clicking overlay
            await page.click(".sidebar-overlay")
            await page.wait_for_timeout(500)

            is_closed = await sidebar.evaluate("el => !el.classList.contains('sidebar-open')")
            if is_closed:
                print("SUCCESS: Sidebar closed after clicking overlay.")
            else:
                print("FAILURE: Sidebar did NOT close after clicking overlay.")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="error_screenshot.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
