import re
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/login")
    page.fill("input[type='text']", "+917002492207")
    page.fill("input[type='password']", "Abc123")
    page.click("button[type='submit']")

    try:
        page.wait_for_selector("text=Set up later", timeout=2000)
        page.click("text=Set up later")
    except:
        pass
    expect(page.locator("h1.page-title")).to_be_visible(timeout=10000)

    page.click("text=Labourers")
    expect(page.locator("h1.page-title")).to_have_text("Labourers")
    page.select_option("select[required]", index=1)
    page.click("button[type='submit']")

    page.click("button.tab-button >> text=Attendance")
    page.fill("input[type='date']", "2024-05-01")
    page.click("button:has-text('Fetch')")

    page.wait_for_timeout(2000)
    print("Page URL is:", page.url)
    print("Errors on page?", page.locator(".field-error").all_inner_texts())

    browser.close()
