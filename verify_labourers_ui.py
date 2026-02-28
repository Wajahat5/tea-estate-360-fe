from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={'width': 1280, 'height': 720}
    )
    page = context.new_page()

    # Login
    print("Navigating to login page...")
    page.goto("http://localhost:5173/login")
    page.wait_for_selector('input[type="text"]')
    page.fill('input[type="text"]', "+917002492207")
    page.fill('input[type="password"]', "Abc123")
    page.click('button[type="submit"]')

    # 1. Verify Labourers Page UI Matches Employees UI
    print("Verifying Labourers page UI...")
    page.click("a[href='/labourers']")
    page.wait_for_url("**/labourers")

    # The filter form should be present
    page.wait_for_selector("form.request-filters-form")

    # Table should NOT be present before search
    try:
        page.wait_for_selector("table.table", timeout=1000)
        print("Error: Table should not be visible before search.")
    except:
        print("Table correctly hidden before search.")

    # Select a garden
    garden_select = page.locator("select.field-input").first
    if garden_select.is_visible():
        garden_select.select_option(index=1)
        print("Selected a garden filter.")

    # Click Submit
    page.click('button[type="submit"]:has-text("Submit")')

    # Table should now be visible
    try:
        page.wait_for_selector("table.table", timeout=5000)
        print("Table found after search.")
    except:
        print("Error: Table not found after search. Check for No Results.")
        if page.locator(".no-results").is_visible():
            print("No results found.")

    page.screenshot(path="verification_labourers_ui_match.png")
    print("Labourers page screenshot taken.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
