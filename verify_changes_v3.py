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

    # Wait for inputs to be visible
    page.wait_for_selector('input[type="text"]')

    # Fill login form
    print("Filling login form...")
    page.fill('input[type="text"]', "+917002492207")
    page.fill('input[type="password"]', "Abc123")
    page.click('button[type="submit"]')

    # Wait for dashboard
    print("Waiting for dashboard...")
    page.wait_for_url("**/dashboard")
    page.wait_for_selector(".page-title:has-text('Dashboard')")
    print("Dashboard loaded.")

    # 1. Verify Responsive Sidebar (Mobile View)
    print("Verifying responsive sidebar...")
    mobile_context = browser.new_context(
        viewport={'width': 375, 'height': 667} # iPhone SE size
    )
    mobile_page = mobile_context.new_page()

    # Login again in mobile context
    mobile_page.goto("http://localhost:5173/login")
    mobile_page.wait_for_selector('input[type="text"]')
    mobile_page.fill('input[type="text"]', "+917002492207")
    mobile_page.fill('input[type="password"]', "Abc123")
    mobile_page.click('button[type="submit"]')
    mobile_page.wait_for_url("**/dashboard")

    # Check if sidebar is hidden initially
    # We check if the sidebar-open class is NOT present
    sidebar = mobile_page.locator(".sidebar")
    classes = sidebar.get_attribute("class")
    if "sidebar-open" in classes:
        print("Error: Sidebar should be closed initially on mobile")
    else:
        print("Sidebar is correctly hidden on mobile start.")

    # Click menu button
    mobile_page.click(".mobile-menu-button")
    mobile_page.wait_for_selector(".sidebar.sidebar-open")
    mobile_page.screenshot(path="verification_mobile_sidebar.png")
    print("Mobile sidebar opened and screenshot taken.")

    mobile_context.close()

    # 2. Verify Expenses Amount Field
    print("Verifying expenses amount field...")
    page.click("a[href='/expenses']")
    page.wait_for_url("**/expenses")

    # Check if Amount column exists in table
    page.wait_for_selector("table th:has-text('Amount')")
    print("Amount column found in table.")

    # Open Create Expense Modal
    page.click("button:has-text('Create Expense')")
    page.wait_for_selector(".modal-card")

    # Check if Amount input exists
    if page.locator("input[name='amount']").is_visible():
        print("Amount field exists in Create form.")
    else:
        print("Error: Amount field missing in Create form.")

    page.screenshot(path="verification_expenses_modal.png")
    print("Expenses modal screenshot taken.")

    # Close modal
    page.click("button:has-text('Close')")

    # 3. Verify Dashboard Filtering
    print("Verifying dashboard filtering...")
    page.goto("http://localhost:5173/dashboard")

    # Select a garden if available
    garden_select = page.locator("select.field-input").first
    if garden_select.is_visible():
        # Wait for options to populate
        page.wait_for_timeout(1000)
        # Select by value if possible, or index
        # Let's try to select the first non-empty option
        options = garden_select.locator("option")
        count = options.count()
        if count > 1:
            garden_select.select_option(index=1)
            print("Selected a garden filter.")

    page.click("button:has-text('Load Dashboard')")
    # Wait for results
    page.wait_for_selector(".stat-card")
    page.screenshot(path="verification_dashboard.png")
    print("Dashboard filtered screenshot taken.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
