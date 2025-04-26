from linkd import get_contacts
from fastapi import FastAPI
from hunter import find_email

app = FastAPI(title="My Local API")

def format_contacts(data):
    formatted_contacts = []
    response = data.json()
    for contact in response['results']:
        profile = contact.get('profile', {})
        name = profile.get('name')
        title = profile.get('title')
        location = profile.get('location')
        linkedin_url = profile.get('linkedin_url')
        profile_picture_url = profile.get('profile_picture_url')
        company = None
        experiences = contact.get('experience', [])
        if experiences:
            company = experiences[0].get('company_name')
        email = find_email(name, company)
        formatted_contact = {
            'name': name,
            'title': title,
            'company': company,
            'location': location,
            'linkedin_url': linkedin_url,
            'profile_picture_url': profile_picture_url,
            'email': email
        }
        formatted_contacts.append(formatted_contact)
    return formatted_contacts       

@app.get("/contacts/{query}")
def get_contacts_list(query, limit=10):
    data = get_contacts(query, limit)
    return format_contacts(data)

    
