from dotenv import load_dotenv
import requests
import os

load_dotenv()
api_key = os.getenv("LINKD_API_KEY")
if not api_key:
    raise ValueError("LINKD_API_KEY is not set in the .env file.")

def get_contacts(query, limit=30):
    url = "https://search.linkd.inc/api/search/users"
    headers = {
        "Authorization": f"Bearer {api_key}",
    }
    params = {
        "query": query,
        "school": "University of California, Los Angeles",
        "limit": limit, 
    }
    response = requests.get(url, headers=headers, params=params)
    if response.ok:
        print("LINKD Response JSON:", response.json())
    else:
        print(f"Request failed: {response.status_code} {response.text}")
    return response