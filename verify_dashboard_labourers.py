from playwright.sync_api import sync_playwright

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

    # 1. Verify Dashboard Summary
    print("Waiting for dashboard summary...")
    page.wait_for_url("**/dashboard")
    page.wait_for_selector(".page-title:has-text('Dashboard')")

    # Wait for at least one stat card to load
    page.wait_for_selector(".stat-card")

    # Verify presence of specific cards by label
    labels = [
        "Labourers",
        "Employees",
        "Review Requests",
        "Unpaid Expenses",
        "Not Started Tasks",
        "In Progress Tasks"
    ]

    for label in labels:
        if page.locator(f".stat-card-label:has-text('{label}')").is_visible():
            print(f"Verified card: {label}")
        else:
            print(f"Error: Card '{label}' not found")

    page.screenshot(path="verification_dashboard_summary.png")
    print("Dashboard summary screenshot taken.")

    # 2. Verify Labourers Page Filtering
    print("Verifying Labourers page...")
    page.click("a[href='/labourers']")
    page.wait_for_url("**/labourers")

    # Check for garden dropdown
    garden_select = page.locator("select.field-input").first
    if garden_select.is_visible():
        print("Garden dropdown found on Labourers page.")
        # Select an option to trigger fetch
        options = garden_select.locator("option")
        if options.count() > 1:
            garden_select.select_option(index=1)
            print("Selected a garden filter.")
            # Wait a bit for potential fetch (hard to verify network in this simple script without interception,
            # but visual check is good enough for now if no crash)
            page.wait_for_timeout(1000)
    else:
        print("Error: Garden dropdown not found on Labourers page.")

    page.screenshot(path="verification_labourers_filter.png")
    print("Labourers page screenshot taken.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
