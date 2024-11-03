from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
import bcrypt

# Create the connection string to your AWS RDS MySQL database
db_connection_str = 'mysql+mysqlconnector://imusic:imusicdb@imusic-db.cvwseqsk6sgv.us-east-2.rds.amazonaws.com:3306/imusic'

# Initialize Flask and enable CORS
app = Flask(__name__)
CORS(app)

# Set up SQLAlchemy engine and metadata
engine = create_engine(db_connection_str)
metadata = MetaData()

# Define the users table schema
users_table = Table('users', metadata,
                    Column('id', Integer, primary_key=True, autoincrement=True),
                    Column('email', String(255), nullable=False, unique=True),
                    Column('password', String(255), nullable=False)
                    )


# Create table if it doesn't exist
metadata.create_all(engine)

# Temporary in-memory store for user data
temp_users = {}

# Endpoint for email registration step
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    # Store email temporarily
    if email in temp_users:
        return jsonify({"message": "Email is already registered in the current process"}), 400

    temp_users[email] = {"password": None}

    return jsonify({"message": f"Email {email} registered successfully"}), 200

# Endpoint for password setup step
@app.route('/password-setup', methods=['POST'])
def password_setup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    # Check if the email is registered in the temporary store
    user_data = temp_users.get(email)
    if not user_data:
        return jsonify({"message": "Email not found. Please register first."}), 404

    # Hash the password for security
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Save the user to the database
    with engine.connect() as connection:
        try:
            insert_stmt = users_table.insert().values(email=email, password=hashed_password)
            connection.execute(insert_stmt)
        except Exception as e:
            return jsonify({"message": f"Error saving to database: {str(e)}"}), 500

    # Remove the temporary entry after saving to database
    del temp_users[email]

    return jsonify({"message": "Password set successfully and user registered"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)