import requests
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("HUNTER_API_KEY")
if not api_key:
    raise ValueError("HUNTER_API_KEY is not set in the .env file.")

def find_email(full_name, company, api_key=api_key):
    url = "https://api.hunter.io/v2/email-finder"
    params = {
        "company": "moveworks",
        "full_name": "Rahul Natarajan",
        "api_key": api_key
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        return data.get('data', {}).get('email', 'No email found')
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None