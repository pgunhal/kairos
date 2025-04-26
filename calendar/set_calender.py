import os.path
import datetime
from datetime import timedelta, timezone
from datetime import datetime # Add datetime import
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from get_calendar import get_formatted_availability
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY is not set in the .env file.")
# If modifying these SCOPES, delete the file token.json
# Grant read/write access
SCOPES = ['https://www.googleapis.com/auth/calendar']

TOKEN_PATH = 'calendar/token.json'
CLIENT_SECRET_PATH = 'calendar/client_secret.json'

def authenticate_google_calendar():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRET_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())

    return creds

def get_calendar_time():
    calendar_availability = get_formatted_availability()
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"""Pick the most likely time for a meeting within the dates given based on the calendar availability,
                Be careful to only pick a single time and output this in the exact format,
                only allowing 9-5 m-f pst times to be set.Also, only output that exact time output nothing else
                Output in the format “2025-01-01T01:00”
                {calendar_availability}"""
    )
    # print(response.text) # Remove the print here
    try:
        # Parse the string into a datetime object
        time_str = response.text.strip() # Remove potential leading/trailing whitespace
        # Assuming the format is always YYYY-MM-DDTHH:MM
        datetime_obj = datetime.fromisoformat(time_str)
        return datetime_obj
    except ValueError:
        print(f"Error: Could not parse Gemini response '{response.text}' into a datetime object.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during parsing: {e}")
        return None
    
def create_calendar_event(start_time):
    """Creates a 30-minute event on the primary calendar."""
    creds = authenticate_google_calendar()
    service = build('calendar', 'v3', credentials=creds)

    # Calculate end time (30 minutes after start time)
    end_time = start_time + timedelta(minutes=30)

    # Format times for Google Calendar API (ISO 8601 format)
    start_iso = start_time.isoformat()
    end_iso = end_time.isoformat()

    event = {
        'summary': 'UCLA Internship Meeting🚀', # You can customize the event title
        'start': {
            'dateTime': start_iso,
            'timeZone': 'America/Los_Angeles', # Or get the local timezone dynamically
        },
        'end': {
            'dateTime': end_iso,
            'timeZone': 'America/Los_Angeles', # Or get the local timezone dynamically
        },
    }

    try:
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        print(f"Event created: {created_event.get('htmlLink')}")
        return created_event
    except Exception as e:
        print(f"An error occurred creating the event: {e}")
        return None   


def main():
    selected_time = get_calendar_time()
    if selected_time:
        print(f"Selected datetime object: {selected_time}")
        # Now you can use the selected_time datetime object for scheduling
    else:
        print("Could not determine a time.")
    create_calendar_event(selected_time)

if __name__ == "__main__":
    main()
