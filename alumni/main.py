from linkd import get_contacts
from fastapi import FastAPI
from hunter import find_email

app = FastAPI(title="Linkd Alumni Finder")

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

def match_contact(contact: dict, query: str) -> bool:
    """Basic case-insensitive keyword matching in name, title, company, location."""
    query_lower = query.lower()
    return (
        query_lower in (contact.get('name') or '').lower()
        or query_lower in (contact.get('title') or '').lower()
        or query_lower in (contact.get('company') or '').lower()
        or query_lower in (contact.get('location') or '').lower()
    )


@app.get("/contacts/{query}")
def get_contacts_list(query, limit=10):
    # data = get_contacts(query, limit)
    # contacts = format_contacts(data)
    #API TOO EXPENSIVE LOL
    contacts =  [{'name': 'Hector Enrique Muñoz, Ph.D.', 'title': 'Senior Machine Learning Scientist', 'company': 'Vir Biotechnology, Inc.', 'location': 'San Francisco Bay Area', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAARg64YB0ve_eF0C23ZheO4XzlpEeTb4MlU', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/D5603AQGZGNjo7LyZYA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727791005820?e=1746057600&v=beta&t=1R73xI3B5i6Gk_4hnfJoitzfzy6l1eYjBsfaHPQVX_c', 'email': 'henrique-munoz@vir.bio'},
            {'name': 'Jeffrey Chongsathien', 'title': 'Software Engineering Manager', 'company': 'Oxford Instruments', 'location': 'Bridgend, Wales, United Kingdom', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAAHoQuwBz_kVII_c7c8atrABMU2KpptGGsQ', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/C4D03AQFpf4PRVEkg-A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1626991622176?e=1745452800&v=beta&t=kiVTs81CHsBdWn_P6y4hVGomYsK-mjtJgcJUWxX5pt0', 'email': 'jeffrey.chongsathien@oxinst.com'},
            {'name': 'Edoardo Gabbi', 'title': 'Business Analyst', 'company': 'McKinsey & Company', 'location': 'Italy', 'linkedin_url': 'https://www.linkedin.com/in/ACwAACHm8OwBSMNGhbYUdGT5YsOxo5fCXJOWH8c', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/D4D03AQEvuds72oJ67g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1675237503812?e=1745452800&v=beta&t=iNAZ4rHzOGN5XSRrrfzeYWyj6SnsMiV8iE7_FyCY4A8', 'email': 'edoardo_gabbi@mckinsey.com'},
            {'name': 'Louise Lehman', 'title': 'Software Engineer', 'company': 'Ambrook', 'location': 'United States', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAA3KV8UBwKwXCHBBFca96Mtkr-zLnAxYJaE', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/C5603AQHwLjxEstgRlw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1619544544873?e=1745452800&v=beta&t=m3UalBpf6QCHCwQIbm5sb5NnoTEs3WQNC97jxqT_Ims', 'email': 'louise@ambrook.com'},
            {'name': 'Mark Edmonds', 'title': 'Senior Applied Scientist II', 'company': 'Cruise', 'location': 'Greater Boston', 'linkedin_url': 'https://www.linkedin.com/in/ACwAABhqKGwBu0WNULwklqZOdUj7Z0uIxkH9VAs', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/C4E03AQE_N9b6QzpTCA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1594570392526?e=1744848000&v=beta&t=py701-WCB0s9A5YyMLilonMnLMMDE_TcQjVytA9w3vI', 'email': 'mark.edmonds@getcruise.com'},
            {'name': 'Leo Wu', 'title': 'Technical Lead, Principle', 'company': 'Blizzard Entertainment', 'location': 'Irvine, California, United States', 'linkedin_url': 'https://www.linkedin.com/in/ACwAABU9oOIBHzBlPRiHRsJPWtuxYHWQjJjFmFg', 'profile_picture_url': '', 'email': 'lwu@blizzard.com'},
            {'name': 'Li-Ming (Lawrence) Lee', 'title': 'Head of Effects', 'company': 'DreamWorks Animation', 'location': 'Arcadia, California, United States', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAAEF9V0BPV68SaLFhdyK7_TnBk6iaoJqAPI', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/D5603AQF7U78RBpNQ1w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1721324366267?e=1744848000&v=beta&t=cp_ifsNuqjiH5UYOR24TQgIHbtl05ZJPQ25Vy4uAO6k', 'email': 'ming.lee@dreamworks.com'},
            {'name': 'Garrett Reynolds', 'title': 'Cofounder', 'company': 'UpCodes', 'location': 'Austin, Texas, United States', 'linkedin_url': 'https://www.linkedin.com/in/ACwAABWK6hUBeOR25tEK6wnxUrXfpu3XzsVtmn4', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/C4E03AQHW4DGd5ur1ww/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517029260010?e=1747267200&v=beta&t=VIX5SJB0fOdl9WnTsqkLDQY5exr_K4UIoq-ijjuNCZc', 'email': 'garrett@up.codes'},
            {'name': 'Dan Hanchey', 'title': 'Director of Software Engineering', 'company': 'Nile', 'location': 'Camarillo, California, United States', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAAfNTH4BMVLz7NHInQL6AJ7PtDmJTMIdiPk', 'profile_picture_url': '', 'email': 'dan@nile-elt.com'},
            {'name': 'Dinesh Coca', 'title': 'Product Lead, Workforce Management', 'company': 'Motive', 'location': 'Los Angeles Metropolitan Area', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAACyMoYBtdX3N-5YVq0jFOBQadi_aA34Okc', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/C5603AQFGmz_e-1wsLw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1633013365231?e=1744848000&v=beta&t=7c9vN7ysFPxw8X-QCyd4tWXaHXu_d0-U6PoQE2LszpE', 'email': 'dinesh.coca@motive.com'},
            {'name': 'Giuliano Gabella', 'title': 'Software Engineer II', 'company': 'Udemy', 'location': 'Austin, Texas, United States', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAAyfbBkBNUtKyRIG0lQrVY2l8dMXqA4I014', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/D5603AQFMosSj6znKrg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1683325205277?e=1746057600&v=beta&t=au5x4nFVkGx3IQ_VVm1IS3trgiHiSn87XccwC6_lqqA', 'email': 'giuliano.gabella@udemy.com'},
            {'name': 'Pranav Gunhal', 'title': 'Software Engineering Intern', 'company': 'NextFoundArtist', 'location': 'Bridgend, Wales, United Kingdom', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAAHoQuwBz_kVII_c7c8atrABMU2KpptGGsQ', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/C4D03AQFpf4PRVEkg-A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1626991622176?e=1745452800&v=beta&t=kiVTs81CHsBdWn_P6y4hVGomYsK-mjtJgcJUWxX5pt0', 'email': 'pranav.gunhal@gmail.com'},
            {'name': 'Lisa Cabadas', 'title': 'Technical Consultant', 'company': 'WiseTech Global', 'location': 'Perth, Western Australia, Australia', 'linkedin_url': 'https://www.linkedin.com/in/ACwAAC4Z2bQBGf_PZR0G2k9rhKMXegV2avlqACc', 'profile_picture_url': 'https://media.licdn.com/dms/image/v2/D5603AQFL54R_gWI4vA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1691651137171?e=1744848000&v=beta&t=CuEqLgUHY8IhWTyU1EK9U0c8eE0tRcvcB9KVJIF5Hxw', 'email': 'lisa.cabadas@wisetechglobal.com'},
            {'name': 'Desiree Lenart', 'title': 'Senior Software Engineer, Frontend', 'company': 'Webflow', 'location': 'Los Angeles Metropolitan Area', 'linkedin_url': 'https://www.linkedin.com/in/ACwAABeRXgQBSCzKoVHdx2AEtIV3otPOdudsEpo', 'profile_picture_url': '', 'email': 'desiree.lenart@webflow.io'}]

    matching_contacts = [c for c in contacts if match_contact(c, query)]

    # Apply limit
    return matching_contacts[:limit]