import requests
import json
import pandas as pd
from sqlalchemy import create_engine

API_KEY = 'NDuQyZHdaWVNgxW9ss0aS896Fu84VUmo'
BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json'

def get_artist_events(artist_name):
    params = {
        'apikey': API_KEY,
        'keyword': artist_name,
        'classificationName': 'music',
        'size': 10  # num result returned
    }

    response = requests.get(BASE_URL, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to retrieve events for {artist_name}. Status code: {response.status_code}")
        return None

def extract_event_details(events_data, artist_name):
    event_list = []

    if events_data and '_embedded' in events_data and 'events' in events_data['_embedded']:
        for event in events_data['_embedded']['events']:
            event_name = event.get('name', 'N/A')
            event_time_full = event.get('dates', {}).get('start', {}).get('dateTime', 'N/A')
            event_time = event_time_full.split("T")[0] if event_time_full != 'N/A' else 'N/A'
            venue = event.get('_embedded', {}).get('venues', [{}])[0]

            event_address = venue.get('address', {}).get('line1', 'N/A')
            city = venue.get('city', {}).get('name', 'N/A')
            state = venue.get('state', {}).get('name', 'N/A')

            location = f"{event_address}, {city}, {state}" if event_address != 'N/A' else f"{city}, {state}"

            event_list.append({
                'Artist Name': artist_name,
                'Event Name': event_name,
                'Location': location,
                'Event Date': event_time
            })
    else:
        print(f"No events found for {artist_name}.")

    return event_list

artists = ['Coldplay', 'Taylor Swift', 'Post Malone']

all_events = []

for artist in artists:
    print(f"Fetching events for {artist}...")
    events_data = get_artist_events(artist)
    if events_data:
        event_details = extract_event_details(events_data, artist)
        all_events.extend(event_details)

df = pd.DataFrame(all_events)

print(df)

# Updated connection string to connect to AWS RDS instance
db_connection_str = 'mysql+mysqlconnector://imusic:imusicdb@imusic-db.cvwseqsk6sgv.us-east-2.rds.amazonaws.com:3306/iMusic'

# Create SQLAlchemy engine to connect to the RDS database
engine = create_engine(db_connection_str)

# Export the DataFrame to the 'events' table in the 'iMusic' database
df.to_sql('events', con=engine, if_exists='replace', index=False)

print("Data successfully exported to the database.")



