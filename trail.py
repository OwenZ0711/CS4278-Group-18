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

# Define the users table schema fetched from 
users_table = Table('users', metadata,
                    Column('id', Integer, primary_key=True, autoincrement=True),
                    Column('email', String(255), nullable=False, unique=True),
                    Column('password', String(255), nullable=False)
                    )


# Create the table in the database
def create_users_table():
    metadata.create_all(engine)


# Call the function to create the table at app start
create_users_table()


@app.route('/register', methods=['Get', 'POST'])
def register():
    data = request.get_json()
    step = data.get('step')

    # Establish connection
    conn = engine.connect()

    if step == 1:
        # Handle email submission
        email = data.get('email')
        try:
            # Insert the email into the users table
            query = users_table.insert().values(email=email)
            conn.execute(query)
            return jsonify({"message": "Email recorded, proceed to next step"}), 201
        except Exception as e:
            return jsonify({"message": "Failed to record email", "error": str(e)}), 500

    elif step == 2:
        # Handle password submission for the previously stored email
        email = data.get('email')
        password = data.get('password')

        # Hash the password using bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        try:
            # Update the record with the hashed password
            query = users_table.update().where(users_table.c.email == email).values(
                password=hashed_password.decode('utf-8'))
            conn.execute(query)
            return jsonify({"message": "Registration completed successfully"}), 201
        except Exception as e:
            return jsonify({"message": "Failed to complete registration", "error": str(e)}), 500
    else:
        return jsonify({"message": "Invalid registration step"}), 400


@app.route('/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = engine.connect()
    try:
        # Select the hashed password from the database
        query = users_table.select().where(users_table.c.email == email)
        result = conn.execute(query).fetchone()

        if result:
            stored_password = result['password']

            # Compare hashed password using bcrypt
            if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
                return jsonify({"message": "Login successful"}), 200
            else:
                return jsonify({"message": "Invalid email or password"}), 401
        else:
            return jsonify({"message": "Invalid email or password"}), 401

    except Exception as e:
        return jsonify({"message": "Failed to login", "error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000)