from .apollo import get_email
from .linkd import get_contacts

def format_contacts(contacts):
    formatted_contacts = []
    for contact in contacts:
        name = contact.get('name')
        title = contact.get('title')
        company = contact.get('company')
        location = contact.get('location')
        linkedin_url = contact.get('linkedin_url')
        email = get_email(linkedin_url)
        
        formatted_contact = {
            'name': name,
            'title': title,
            'company': company,
            'location': location,
            'linkedin_url': linkedin_url,
            'email': email
        }
        formatted_contacts.append(formatted_contact)
    return formatted_contacts       

def get_contacts_list(query, limit=30):
    contacts = get_contacts(query, limit)
    return format_contacts(contacts)

    
