from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={'width': 1280, 'height': 720}
    )
    page = context.new_page()

    # Login as existing owner
    print("Navigating to login page...")
    page.goto("http://localhost:5173/login")
    page.wait_for_selector('input[type="text"]')
    page.fill('input[type="text"]', "+917002492207")
    page.fill('input[type="password"]', "Abc123")
    page.click('button[type="submit"]')

    # Wait for dashboard
    page.wait_for_url("**/dashboard")

    # Go to Companies Page
    print("Navigating to Companies page...")
    page.click("a[href='/companies']")
    page.wait_for_url("**/companies")

    # The existing owner should see "Join Requests" because we mocked access_requests in companies list
    try:
        page.wait_for_selector("h2:has-text('Join Requests')", timeout=5000)
        print("Join Requests panel is visible.")

        # Verify Accept / Reject buttons
        page.wait_for_selector("button:has-text('Accept')")
        page.wait_for_selector("button:has-text('Reject')")
        print("Accept/Reject buttons are present.")

    except Exception as e:
        print(f"Error: Join Requests panel not found or missing buttons. {e}")

    page.screenshot(path="verification_companies_join_reqs.png")
    print("Companies screenshot taken.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
