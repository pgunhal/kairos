import os.path
import datetime
from datetime import timedelta, timezone
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

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

def get_calendar_availability(days=7):
    """
    Gets calendar availability for the next 'days' days
    Returns a dictionary with dates as keys and lists of available 30-min time slots
    """
    # Use direct freebusy API to get accurate busy times
    creds = authenticate_google_calendar()
    service = build('calendar', 'v3', credentials=creds)
    
    # Get current date/time in UTC
    now = datetime.datetime.now(timezone.utc)
    end_date = now + timedelta(days=days)
    
    # Get all calendar IDs
    calendar_list = service.calendarList().list().execute()
    calendar_ids = [calendar['id'] for calendar in calendar_list.get('items', [])]
    
    # Create freebusy query for all calendars
    freebusy_query = {
        "timeMin": now.isoformat(),
        "timeMax": end_date.isoformat(),
        "items": [{"id": cal_id} for cal_id in calendar_ids],
        "timeZone": "America/Los_Angeles"  # Use Pacific time explicitly
    }
    
    # Get freebusy information
    freebusy_result = service.freebusy().query(body=freebusy_query).execute()
    
    # Store availability by date
    availability_by_date = {}
    
    # Process each day
    for day_offset in range(days):
        current_date = (now + timedelta(days=day_offset)).date()
        
        # Skip weekends
        if current_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            continue
        
        # Generate all possible 30-minute time slots for business hours (9am-5pm)
        all_slots = []
        for hour in range(9, 17):  # 9am to 5pm
            all_slots.append(f"{hour}:00")
            all_slots.append(f"{hour}:30")
        
        # Convert time slots to datetime objects for comparison
        time_slots = {}
        for slot in all_slots:
            hour, minute = map(int, slot.split(':'))
            
            # Create datetime in Pacific time
            slot_dt = datetime.datetime.combine(
                current_date,
                datetime.time(hour=hour, minute=minute),
                tzinfo=timezone(timedelta(hours=-7))  # Pacific time (UTC-7)
            )
            
            # Convert to UTC for comparison with freebusy data
            slot_utc = slot_dt.astimezone(timezone.utc)
            time_slots[slot] = (slot_utc, slot_utc + timedelta(minutes=30))
        
        # Check each time slot against busy periods
        available_slots = []
        for slot, (slot_start_utc, slot_end_utc) in time_slots.items():
            is_available = True
            
            # Check against all calendars
            for cal_id in calendar_ids:
                if cal_id not in freebusy_result['calendars']:
                    continue
                    
                # Get busy periods for this calendar
                busy_periods = freebusy_result['calendars'][cal_id].get('busy', [])
                
                # Check if slot overlaps with any busy period
                for busy_period in busy_periods:
                    busy_start = datetime.datetime.fromisoformat(
                        busy_period['start'].replace('Z', '+00:00')
                    )
                    busy_end = datetime.datetime.fromisoformat(
                        busy_period['end'].replace('Z', '+00:00')
                    )
                    
                    # Check for overlap
                    if slot_start_utc < busy_end and slot_end_utc > busy_start:
                        is_available = False
                        break
                        
                if not is_available:
                    break
            
            if is_available:
                available_slots.append(slot)
        
        # Store available slots for this day
        availability_by_date[current_date.isoformat()] = available_slots
    
    return availability_by_date

def get_formatted_availability():
    availability = get_calendar_availability()
    lines = []
    lines.append("Your available 30-minute time slots for the next week:\n")
    
    for date, slots in availability.items():
        lines.append(f"{date}:")
        if slots:
            lines.append("  Available: " + ", ".join(slots))
        else:
            lines.append("  No availability")
    
    return "\n".join(lines)

def main():
    print(get_formatted_availability())

if __name__ == '__main__':
    main()