from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_session import Session
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, text
import bcrypt

# Create the connection string to your AWS RDS MySQL database
db_connection_str = 'mysql+mysqlconnector://imusic:imusicdb@imusic-db.cvwseqsk6sgv.us-east-2.rds.amazonaws.com:3306/imusic'

# Initialize Flask and enable CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Set up SQLAlchemy engine and metadata
engine = create_engine(db_connection_str)
metadata = MetaData()

# Define the users table schema
users_table = Table('users', metadata,
                    Column('id', Integer, primary_key=True, autoincrement=True),
                    Column('email', String(255), nullable=False, unique=True),
                    Column('password', String(255), nullable=False),
                    Column('userlocation', String(255)),
                    Column('token', String(255))
                    )


# Create table if it doesn't exist
metadata.create_all(engine)

# Configure session type (using in-memory storage for simplicity)
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Endpoint for email registration step
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    # Save email to the session
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

    return jsonify({"message": "Password saved successfully"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

# Endpoint for location selection step
@app.route('/location-selection', methods=['POST'])
def location_selection():
    data = request.get_json()
    location = data.get('location')

    if not location:
        return jsonify({"message": "Location is required"}), 400

    # Save location to the session
    session['location'] = location

    return jsonify({"message": "Location saved successfully"}), 200

# Endpoint to save user to the database after completing all registration steps
@app.route('/complete-registration', methods=['POST'])
def complete_registration():
    email = session.get('email')
    password = session.get('password')
    location = session.get('location')

    if not all([email, password, location]):
        return jsonify({"message": "Incomplete registration data"}), 400

    # Save user to the database (using SQLAlchemy)
    try:
        with engine.connect() as connection:
            insert_stmt = text("""
            INSERT INTO users (email, password, location)
            VALUES (:email, :password, :location)
            """)
            connection.execute(insert_stmt, email=email, password=password, location=location)
    except Exception as e:
        return jsonify({"message": f"Error saving to database: {str(e)}"}), 500

    return jsonify({"message": "Registration completed successfully"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
