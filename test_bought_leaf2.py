from playwright.sync_api import sync_playwright
import time
import os

def load_env_file(filepath):
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found.")
        return
    with open(filepath, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, value = line.split("=", 1)
                os.environ[key] = value

def main():
    load_env_file("/app/tea-garden-project/.env")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to login...")
        page.goto("http://localhost:5173/login")

        # In case we get redirected to dashboard immediately
        if page.url == "http://localhost:5173/companies" or page.url == "http://localhost:5173/":
             print("Already logged in.")
        else:
             print("Logging in...")
             page.fill("input[type='text']", "+917002492207")
             page.fill("input[type='password']", "Abc123")
             page.click("button[type='submit']")

             print("Waiting for dashboard...")
             try:
                 page.wait_for_selector(".topbar-user-wrapper", timeout=10000)
             except Exception as e:
                 print("Login error:")
                 page.screenshot(path="/home/jules/debug_login_error.png")
                 print(e)
                 return

        page.goto("http://localhost:5173/bought-leaf")
        print("Navigated to bought leaf")

        page.wait_for_selector(".page-title", timeout=5000)

        print("Taking screenshots...")
        # Take screenshot of Suppliers tab
        page.screenshot(path="/home/jules/bought_leaf_suppliers.png")

        # Click Rate Cards tab
        page.click("text=Rate Cards")
        time.sleep(1)
        page.screenshot(path="/home/jules/bought_leaf_price.png")

        # Click Daily Logging tab
        page.click("text=Daily Logging")
        time.sleep(1)
        page.screenshot(path="/home/jules/bought_leaf_log.png")

        # Click Analytics tab
        page.click("text=Analytics")
        time.sleep(1)
        page.screenshot(path="/home/jules/bought_leaf_analytics.png")
        print("Done")


        print("Now verifying Settings alerts...")
        page.goto("http://localhost:5173/settings")
        page.wait_for_selector(".page-title", timeout=5000)

        # Try to submit the basic info update
        page.fill("input[placeholder='Daily Wage (₹)']", "300")
        page.click("text=Update Wages")
        time.sleep(0.5)
        # Should show a green banner
        page.screenshot(path="/home/jules/settings_success_banner.png")


        browser.close()

if __name__ == "__main__":
    main()
