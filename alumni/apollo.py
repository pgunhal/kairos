import requests 
import os
from dotenv import load_dotenv


load_dotenv()
api_key = os.getenv("APOLLO_API_KEY")
if not api_key:
    raise ValueError("APOLLO_API_KEY is not set in the .env file.")


def post_request(url, params, api_key):
    headers = {
        "x-api-key": f"{api_key}",
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    response = requests.post(url, headers=headers, json=params)
    if response.ok:
        print("Response JSON:", response.json())
        return response.json()
    else:
        print(f"Request failed: {response.status_code} {response.text}")
        return None

def get_email(linkedin, api_key):
    url = "https://api.apollo.io/api/v1/people/match"
    params = {
      "linkedin_url": linkedin,
    }
    response = post_request(url, params, api_key)
    email = response.get('person', {}).get('contact', {}).get('email', '')
    return email