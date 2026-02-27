from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        # Create a new context with a specific viewport size
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            print("Navigating to login page...")
            page.goto("http://localhost:5173/login")

            # Wait for login form to appear - using a longer timeout and waiting for visibility
            print("Waiting for login form...")
            try:
                # Based on the code, the input is type="text" but placeholder suggests phone
                page.wait_for_selector('input[type="text"]', state="visible", timeout=60000)
            except Exception as e:
                print(f"Failed to find login input: {e}")
                page.screenshot(path="error_login_load.png")
                raise

            # Perform login
            print("Filling login form...")
            page.fill('input[type="text"]', "+917002492207")
            page.fill('input[type="password"]', "Abc123")

            # Click submit and wait for navigation
            print("Submitting login...")
            with page.expect_navigation(url="**/dashboard", timeout=60000):
                page.click('button[type="submit"]')
            print("Logged in successfully.")

            # 2. Verify Expenses Page & New Amount Field
            print("Navigating to Expenses page...")
            page.click('a[href="/expenses"]')
            page.wait_for_url("**/expenses")

            # Check for the Create Expense button
            # Wait for it to be visible
            page.wait_for_selector("button:has-text('Create Expense')", state="visible", timeout=30000)

            # Take a screenshot of the Expenses page to verify Layout Fix
            page.screenshot(path="verification_expenses_desktop.png")
            print("Screenshot of Expenses page saved: verification_expenses_desktop.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            # Take a screenshot on failure for debugging
            page.screenshot(path="error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_changes()
