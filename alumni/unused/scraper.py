from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import random

def grab_final_url(linkedin_url):
    options = Options()
    options.debugger_address = "localhost:9222"

    driver = webdriver.Chrome(options=options)

    driver.get(linkedin_url)

    time.sleep(random.uniform(3, 5))  # Wait for JavaScript redirects and page load

    final_url = driver.current_url

    driver.quit()
    return final_url