import re
from playwright.sync_api import Page, expect

def test_attendance_and_payrole_tabs(page: Page):
    # Log in
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

    # Go to Labourers page
    page.click("text=Labourers")
    expect(page.locator("h1.page-title")).to_have_text("Labourers")

    # Select garden and fetch
    page.select_option("select[required]", index=1)
    page.click("button[type='submit']")

    # Verify tabs exist
    expect(page.locator("button.tab-button >> text=Info")).to_be_visible()
    expect(page.locator("button.tab-button >> text=Attendance")).to_be_visible()
    expect(page.locator("button.tab-button >> text=Payrole")).to_be_visible()

    # Click Attendance Tab
    page.click("button.tab-button >> text=Attendance")
    expect(page.locator("text=Add Selected")).to_be_visible()

    # Fill Date and Fetch
    page.fill("input[type='date']", "2024-05-01")
    page.click("button:has-text('Fetch')")
    expect(page.locator("text=Attendance fetched successfully")).to_be_visible()

    # Click first row checkbox
    page.click("tbody >> tr >> nth=0 >> input[type='checkbox']")
    page.select_option("tbody >> tr >> nth=0 >> select >> nth=0", "present")
    page.fill("tbody >> tr >> nth=0 >> input[type='number']", "2")

    # Add Selected
    page.click("button:has-text('Add Selected')")
    expect(page.locator("text=Attendance added successfully")).to_be_visible()

    # Click Payrole Tab
    page.click("button.tab-button >> text=Payrole")
    expect(page.locator("text=Add Payment")).to_be_visible()

    # Fetch Payroll
    page.click("button:has-text('Fetch')")
    expect(page.locator("text=Payroll fetched successfully")).to_be_visible()

    # Select all rows
    page.click("thead >> input[type='checkbox']")
    page.click("button:has-text('Add Payment')")
    expect(page.locator("text=Payments added successfully")).to_be_visible()
