import re
from playwright.sync_api import sync_playwright, Page, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/login")
    page.fill("input[type='text']", "+917012345678")
    page.fill("input[type='password']", "password123")
    page.click("button[type='submit']")

    try:
        page.wait_for_selector("text=Set up later", timeout=2000)
        page.click("text=Set up later")
    except:
        pass

    page.wait_for_timeout(2000)
    print("Page URL is:", page.url)
    print("Page content:", page.content())
    browser.close()
