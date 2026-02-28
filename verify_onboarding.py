from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={'width': 1280, 'height': 720}
    )
    page = context.new_page()

    # Try Signup Flow
    print("Navigating to signup page...")
    page.goto("http://localhost:5173/signup")
    page.wait_for_selector('input[type="text"]')

    # Check that gardenid field is missing (should not throw error if we fill other fields)
    print("Filling signup form...")
    page.fill('label:has-text("Name") input', "New User")
    page.fill('label:has-text("Phone") input', "+919876543210")
    page.select_option('select.field-input', 'owner')
    page.fill('input[type="password"]', "Abc123")
    page.click('button[type="submit"]')

    # Should redirect to onboarding
    print("Waiting for onboarding page...")
    page.wait_for_url("**/onboarding")
    page.wait_for_selector("h2:has-text('Welcome')")
    print("Onboarding page loaded successfully.")

    # Try "Join Garden" flow
    print("Clicking Join an Existing Garden...")
    page.click("button:has-text('Join an Existing Garden')")
    page.wait_for_selector("h2:has-text('Join a Garden')")

    # Type to search
    print("Searching for company...")
    page.fill('input[placeholder="e.g. Green Leaf Estates"]', "TeaEstate")
    page.click('button:has-text("Search")')

    # Wait for results
    page.wait_for_selector("button:has-text('Join')", timeout=5000)
    print("Company results found.")

    page.screenshot(path="verification_onboarding_join.png")
    print("Onboarding screenshot taken.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
