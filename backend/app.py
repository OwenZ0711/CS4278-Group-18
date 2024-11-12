from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
from flask_session import Session
from backend import InfoKey as Key
import bcrypt
import logging
import requests
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, text, insert, Date, select

logging.basicConfig(level=logging.INFO)
tm_API_KEY = 'NDuQyZHdaWVNgxW9ss0aS896Fu84VUmo'
tm_BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json'

def get_artist_events(artist_name):
    params = {
        'apikey': tm_API_KEY,
        'keyword': artist_name,
        'classificationName': 'music',
        'size': 10  # num result returned
    }

    response = requests.get(tm_BASE_URL, params=params)

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

# Create the connection string to your AWS RDS MySQL database
db_connection_str = 'mysql+mysqlconnector://imusic:imusicdb@imusic-db.cvwseqsk6sgv.us-east-2.rds.amazonaws.com:3306/imusic'

# Initialize Flask and enable CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://frontend2-9wu1azir3-sihan-yes-projects.vercel.app"}},
     supports_credentials=True,
     methods=["GET", "POST", "OPTIONS"],  # Allowed methods
     allow_headers=["Content-Type", "Authorization"])  # Allowed headers
# Configure the secret key and Flask-Session
app.secret_key = "4278427842784278"  # Generates a random key
app.config['SESSION_TYPE'] = 'filesystem'  # Store sessions on the file system

# Initialize the session
Session(app)

# Set up SQLAlchemy engine and metadata
engine = create_engine(db_connection_str)
metadata = MetaData()

# Define the users table schema
users_table = Table('users', metadata,
                    Column('email', String(255), nullable=False, unique=True),
                    Column('password', String(255), nullable=False),
                    Column('userlocation', String(255))
                    )
metadata.create_all(engine)

user_artist_table = Table('userArtist', metadata,
                          Column('email', String(255), nullable=False),
                          Column('artist', String(255), nullable=False)
                          )

# Create the userArtist table if it doesn't exist
metadata.create_all(engine)

events_table = Table('events', metadata,
                     Column('artist', String(255), nullable=False),
                     Column('eventname', String(255), nullable=False),
                     Column('location', String(255)),
                     Column('date', Date)
                    )
metadata.create_all(engine)

# Endpoint for email registration step
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    logging.info(f"data got: {data}")
    email = data.get('email')
    logging.info(f"email got: {email}")

    if not email:
        return jsonify({"message": "Email is required"}), 400

    # Check if the email already exists in the database
    try:
        with engine.connect() as connection:
            check_stmt = text("SELECT * FROM users WHERE email = :email")
            result = connection.execute(check_stmt, {"email": email}).fetchone()
            if result:
                return jsonify({"message": "Email already exists"}), 400

    except Exception as e:
        print(f"Error occurred during email check: {str(e)}")
        return jsonify({"message": f"Error checking email: {str(e)}"}), 500

    # Save email to the session if not already registered
    session['email'] = email

    return jsonify({"message": f"Email {email} registered successfully"}), 200

# Endpoint for password setup step
@app.route('/password-setup', methods=['POST'])
def password_setup():
    data = request.get_json()
    password = data.get('password')
    if not password:
        return jsonify({"message": "Password is required"}), 400

    # Save hashed password to the session
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    session['password'] = hashed_password
    print('session password trial', session["password"], "\n")
    return jsonify({"message": "Password saved successfully"}), 200
  
  
# Endpoint for location selection step
@app.route('/location-selection', methods=['POST'])
def location_selection():
    data = request.get_json()
    location = (data.get('country'), data.get('state'))
    print(session['password'])
    if location[0] == None or location[1] == None:
        session['location'] = None
        return jsonify({"message": "Location is required"}), 400
    else:
        session['location'] = f"{location[0]}, {location[1]}"
        return jsonify({"message": "Location saved successfully"}), 200

# Endpoint to save user to the database after completing all registration steps
@app.route('/complete-registration', methods=['POST'])
def complete_registration():
    email = session.get("email")
    password = session.get('password')
    location = session.get('location')
    print("email", email)
    print("password", password)
    print('location', location)

    if not all([email, password, location]):
        return jsonify({"message": "Incomplete registration data"}), 400

    try:
        with engine.begin() as connection:
            print("Attempting to insert data into the database...")
            insert_stmt = insert(users_table).values(email=email, password=password, userlocation=location)
            connection.execute(insert_stmt)
            print("Data inserted successfully!")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"message": f"Error saving to database: {str(e)}"}), 500


    return jsonify({"message": "Registration completed successfully"}), 200

@app.route("/login", methods=['POST'])
def user_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validate input
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    try:
        # Connect to the database and fetch user by email
        with engine.connect() as connection:
            select_stmt = text("SELECT * FROM users WHERE email = :email")
            user = connection.execute(select_stmt, {"email": email}).fetchone()

            # Check if user exists
            if not user:
                return jsonify({"message": "Email/Password not correct"}), 401

            print(f"User record: {user}")  # Debugging output

            # If `user` is a tuple, adjust the access as needed
            stored_hashed_password = user[1]  # Assuming `password` is the second column

            if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
                session['email'] = email  # Save email in session or user ID if applicable
                print("User login successful.")
                return jsonify({"message": "Login successful. Start linking process"}), 200
            else:
                return jsonify({"message": "Email/Password not correct"}), 401

    except Exception as e:
        print(f"Error during login: {str(e)}")  # Detailed error output
        return jsonify({"message": f"An error occurred during login: {str(e)}"}), 500

@app.route("/loading")
def callback():
  print('loading called')
  if 'error' in request.args:
    return jsonify({"error": request.args['error']})
  
  if 'code' in request.args:
    code = request.args['code']
    # Exchange the code for an access token
    req_body = {
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': Key.REDIRECT_URI,
        'client_id': Key.CLIENT_ID,
        'client_secret': Key.CLIENT_SECRET_ID
    }
    response = requests.post(Key.TOKEN_URL, data=req_body)
    token_info = response.json()
    session['access_token'] = token_info['access_token']
    # if session.get("calling_type", None) == "register":
    #     with engine.connect() as connection:
    #       try:
    #           insert_stmt = users_table.insert().values(email=email, password=hashed_password)
    #           connection.execute(insert_stmt)
    #       except Exception as e:
    #           return jsonify({"message": f"Error saving to database: {str(e)}"}), 500

    # # Remove the temporary entry after saving to database
    #     del temp_users[email]
    print("redirect to playlist")
    return redirect('/playlists')
    #return jsonify({"message": "authentication finished with process:"}, session['calling_type']), 200

@app.route('/playlists')
def get_playlists():
    headers = {
        'Authorization': f"Bearer {session['access_token']}"
    }

    # Get user's liked songs
    response = requests.get(Key.API_BASE_URL + "me/tracks", headers=headers)
    liked_songs_album = response.json()
    liked_songs = liked_songs_album['items']
    artist_set = {
        "name": [],
        "id": [],
    }
    for song in liked_songs:
        track = song['track']
        artist_list = track["artists"]
        for artist_info in artist_list:
            if artist_info['id'] not in artist_set['id']:
                artist_set['name'].append(artist_info['name'])
                artist_set['id'].append(artist_info['id'])
    artists = artist_set['name']
    all_events = []

    # Fetch events for each artist
    for artist in artists:
        print(f"Fetching events for {artist}...")
        events_data = get_artist_events(artist)
        if events_data:
            event_details = extract_event_details(events_data, artist)
            all_events.extend(event_details)

    # Insert data into the database, checking for duplicates
    email = session.get('email')
    print(f'playlist email {email}')
    try:
        with engine.begin() as connection:
            # Insert into userArtist table with duplicate check
            for artist in artists:
                print(f"Checking if artist {artist} for email {email} exists in userArtist table...")
                check_artist_stmt = text("SELECT 1 FROM userArtist WHERE email = :email AND artist = :artist")
                exists = connection.execute(check_artist_stmt, {"email": email, "artist": artist}).fetchone()
                
                if not exists:
                    print(f"Inserting artist {artist} for email {email} into userArtist table...")
                    insert_stmt = insert(user_artist_table).values(email=email, artist=artist)
                    connection.execute(insert_stmt)

            print("Data inserted successfully into userArtist table!")

            # Insert into events table with duplicate check
            for event in all_events:
                print(f"Checking if event {event['Event Name']} exists in events table...")
                check_event_stmt = text(
                    "SELECT 1 FROM events WHERE artist = :artist AND eventname = :eventname AND location = :location AND date = :date"
                )
                exists = connection.execute(check_event_stmt, {
                    "artist": event['Artist Name'],
                    "eventname": event['Event Name'],
                    "location": event['Location'],
                    "date": event['Event Date']
                }).fetchone()
                
                if not exists:
                    print(f"Inserting event {event['Event Name']} into events table...")
                    insert_stmt = insert(events_table).values(
                        artist=event['Artist Name'],
                        eventname=event['Event Name'],
                        location=event['Location'],
                        date=event['Event Date']
                    )
                    connection.execute(insert_stmt)

            print("Events data inserted successfully into events table!")

    except Exception as e:
        print(f"Error occurred while inserting into database tables: {str(e)}")
        return jsonify({"message": f"Error inserting into database tables: {str(e)}"}), 500

    return redirect("https://frontend2-sihanye-sihan-yes-projects.vercel.app/my-artist", code=302)

@app.route('/artist-list', methods = ['GET'])
def get_artist_list():
    print("Session contents:", dict(session))
    email = session.get('email')  # Retrieve the session's email
    if not email:
        return jsonify({"message": "No email found in session."}), 400

    try:
        with engine.connect() as connection:
            select_stmt = text("SELECT artist FROM userArtist WHERE email = :email")
            result = connection.execute(select_stmt, {"email": email}).fetchall()
            artists = [{"name": row[0]} for row in result]  # Adjusted to match the query result
    except Exception as e:
        print("Error fetching artists:", str(e))
        return jsonify({"message": f"Error fetching artists: {str(e)}"}), 500

    return jsonify(artists), 200
'zzy20020711@gmail.com, 12345'

@app.route('/event-list', methods=['GET'])
def get_event_list():
    # Get the user's email from the session
    email = session.get('email')
    if not email:
        return jsonify({"message": "User not logged in"}), 401

    try:
        with engine.connect() as connection:
            # Step 1: Get the list of artists associated with the user's email
            artist_select_stmt = text("SELECT artist FROM userArtist WHERE email = :email")
            artist_result = connection.execute(artist_select_stmt, {"email": email}).fetchall()
            user_artists = [row[0] for row in artist_result]

            if not user_artists:
                return jsonify({"message": "No artists found for this user"}), 404

            # Dynamically generate placeholders for the artist list
            placeholders = ", ".join([f":artist_{i}" for i in range(len(user_artists))])
            event_select_stmt = text(f"SELECT artist, eventname, location, date FROM events WHERE artist IN ({placeholders})")

            # Create the dictionary for binding parameters dynamically
            artist_params = {f"artist_{i}": artist for i, artist in enumerate(user_artists)}

            # Execute the query with the dynamically created artist parameters
            event_result = connection.execute(event_select_stmt, artist_params).fetchall()

            # Step 3: Format the events list to return as JSON
            events = [{
                "Artist Name": row[0],  # artist
                "Event Name": row[1],   # eventname
                "Location": row[2],     # location
                "Event Date": row[3]    # date
            } for row in event_result]

            if not events:
                return jsonify({"message": "No events found for the user's artists"}), 404

            return jsonify(events), 200
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return jsonify({"message": f"Error fetching events: {str(e)}"}), 500
    
# Endpoint to get user profile data
@app.route('/profile', methods=['GET'])
def get_profile():
    email = session.get('email')

    if not email:
        return jsonify({"message": "No email found in session."}), 400

    try:
        # Query to get user data from the users table
        with engine.connect() as connection:
            stmt = select(users_table).where(users_table.c.email == email)
            user = connection.execute(stmt).fetchone()

        if user:
            profile_data = {
                "email": user['email'],
                "location": user['userlocation']
            }
            return jsonify(profile_data), 200
        else:
            return jsonify({"message": "User not found."}), 404

    except Exception as e:
        return jsonify({"message": f"Error fetching profile data: {str(e)}"}), 500
    
# Endpoint to change password
@app.route('/change-password', methods=['POST'])
def change_password():
    email = session.get('email')
    if not email:
        return jsonify({"message": "No email found in session."}), 400

    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({"message": "Current and new passwords are required."}), 400

    try:
        # Query to get the current password hash from the database
        with engine.connect() as connection:
            stmt = select(users_table).where(users_table.c.email == email)
            user = connection.execute(stmt).fetchone()

        if not user:
            return jsonify({"message": "User not found."}), 404

        # Verify the current password
        stored_hashed_password = user['password']
        if not bcrypt.checkpw(current_password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
            return jsonify({"message": "Current password is incorrect."}), 401

        # Hash the new password and update it in the database
        new_hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        with engine.connect() as connection:
            update_stmt = (
                users_table.update()
                .where(users_table.c.email == email)
                .values(password=new_hashed_password)
            )
            connection.execute(update_stmt)

        return jsonify({"message": "Password changed successfully."}), 200
    
    except Exception as e:
        return jsonify({"message": f"Error changing password: {str(e)}"}), 500

# Endpoint to get artist details
@app.route('/artist-details/<artist_name>', methods=['GET'])
def get_artist_details(artist_name):
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM artists WHERE name = :artist_name")
            result = connection.execute(query, artist_name=artist_name).fetchone()
            
            if not result:
                return jsonify({"message": "Artist not found"}), 404
            
            artist = {
                "name": result['name'],
                "description": result.get('description', 'No description available'),
                "image": result.get('image', 'https://via.placeholder.com/150')
            }

        return jsonify(artist), 200

    except Exception as e:
        return jsonify({"message": f"Error fetching artist details: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)