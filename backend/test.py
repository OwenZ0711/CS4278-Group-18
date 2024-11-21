import pytest
from app import app, engine, users_table
from sqlalchemy import text
from unittest.mock import patch
import bcrypt

@pytest.fixture(scope="module")
def test_client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["PROPAGATE_EXCEPTIONS"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(scope="function")
def setup_test_db():
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM users"))
        connection.execute(text("DELETE FROM userArtist"))
        connection.execute(text("DELETE FROM events"))
    yield engine

def test_register_route(test_client, setup_test_db):
    response = test_client.post("/register", json={"email": "uniqueuser@example.com"})
    assert response.status_code == 200
    assert response.json["message"] == "Email uniqueuser@example.com registered successfully"

def test_password_setup(test_client):
    response = test_client.post("/password-setup", json={"password": "securepassword"})
    assert response.status_code == 200
    assert response.json["message"] == "Password saved successfully"
    with test_client.session_transaction() as sess:
        assert "password" in sess

def test_location_selection(test_client):
    response = test_client.post("/location-selection", json={"country": "USA", "state": "California"})
    assert response.status_code == 200
    assert response.json["message"] == "Location saved successfully"
    with test_client.session_transaction() as sess:
        assert sess["location"] == "USA, California"

def test_complete_registration(test_client, setup_test_db):
    with test_client.session_transaction() as sess:
        sess['email'] = "uniqueuser@example.com"
        sess['password'] = bcrypt.hashpw("securepassword".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        sess['location'] = "USA, California"

    response = test_client.post("/complete-registration")
    assert response.status_code == 200
    assert response.json["message"] == "Registration completed successfully"

def test_login_route_success(test_client, setup_test_db):
    hashed_password = bcrypt.hashpw("securepassword".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    with engine.begin() as connection:
        connection.execute(
            text("INSERT INTO users (email, password) VALUES ('uniqueuser@example.com', :hashed_password)"),
            {"hashed_password": hashed_password}
        )

    response = test_client.post("/login", json={"email": "uniqueuser@example.com", "password": "securepassword"})
    assert response.status_code == 200
    assert response.json["message"] == "Login successful. Start linking process"

def test_login_route_failure(test_client, setup_test_db):
    response = test_client.post("/login", json={"email": "wronguser@example.com", "password": "wrongpassword"})
    assert response.status_code == 401
    assert response.json["message"] == "Email/Password not correct"

def test_database_insert(setup_test_db):
    with setup_test_db.begin() as connection:
        connection.execute(
            text("INSERT INTO users (email, password, userlocation) VALUES ('newuser@example.com', 'newpassword', 'USA')")
        )
        result = connection.execute(
            text("SELECT email, password, userlocation FROM users WHERE email='newuser@example.com'")
        ).fetchone()
    
    assert result is not None
    assert result[0] == "newuser@example.com"
    assert result[1] == "newpassword"
    assert result[2] == "USA"

def test_register_email_exists(test_client, setup_test_db):
    with engine.begin() as connection:
        connection.execute(
            text("INSERT INTO users (email, password) VALUES ('existinguser@example.com', 'hashedpassword')")
        )

    response = test_client.post("/register", json={"email": "existinguser@example.com"})
    assert response.status_code == 400
    assert response.json["message"] == "Email already exists"

def test_event_list_empty(test_client, setup_test_db):
    with test_client.session_transaction() as sess:
        sess['email'] = "user@example.com"

    response = test_client.get("/event-list")
    assert response.status_code == 404
    assert response.json["message"] == "No artists found for this user"  # Updated message

def test_event_list_with_events(test_client, setup_test_db):
    with engine.begin() as connection:
        connection.execute(
            text("INSERT INTO userArtist (email, artist) VALUES ('user@example.com', 'Sample Artist')")
        )
        connection.execute(
            text("INSERT INTO events (artist, eventname, location, date) VALUES "
                 "('Sample Artist', 'Sample Event', 'Sample Location', '2024-12-01')")
        )

    with test_client.session_transaction() as sess:
        sess['email'] = "user@example.com"

    response = test_client.get("/event-list")
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["Event Name"] == "Sample Event"
    assert response.json[0]["Location"] == "Sample Location"
    assert response.json[0]["Event Date"].startswith("Sun, 01 Dec 2024 00:00:00 GMT")  # Adjust to partial match

def test_playlists(test_client, setup_test_db):
    with test_client.session_transaction() as sess:
        sess['access_token'] = "mock_access_token"

    with patch("app.requests.get") as mock_get:
        mock_response = {
            "items": [
                {
                    "track": {
                        "artists": [
                            {"name": "Artist 1", "id": "artist_1_id"},
                            {"name": "Artist 2", "id": "artist_2_id"}
                        ]
                    }
                }
            ]
        }
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_response

        response = test_client.get("/playlists")
        assert response.status_code == 302

    with engine.connect() as connection:
        result = connection.execute(text("SELECT * FROM userArtist WHERE email='user@example.com'")).fetchall()
        assert len(result) >= 2

def test_artist_list_empty(test_client, setup_test_db):
    with test_client.session_transaction() as sess:
        sess['email'] = "user@example.com"

    response = test_client.get("/artist-list")
    assert response.status_code == 200
    assert response.json == []

def test_artist_list_with_artists(test_client, setup_test_db):
    with engine.begin() as connection:
        connection.execute(
            text("INSERT INTO userArtist (email, artist) VALUES ('user@example.com', 'Sample Artist')")
        )

    with test_client.session_transaction() as sess:
        sess['email'] = "user@example.com"

    response = test_client.get("/artist-list")
    assert response.status_code == 200
    unique_artists = list({artist['name'] for artist in response.json})
    assert len(unique_artists) == 1
    assert unique_artists[0] == "Sample Artist"
