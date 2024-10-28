from flask import Flask, request, jsonify
from flask_cors import CORS
import MySQLdb

import bcrypt
from sqlalchemy import create_engine

db_connection_str = 'mysql+mysqlconnector://root:root@127.0.0.1:8889/iMusic'

import os
import MySQLdb

db = MySQLdb.connect(
    host=os.getenv("RDS_HOSTNAME"),
    user=os.getenv("RDS_USERNAME"),
    passwd=os.getenv("RDS_PASSWORD"),
    db="imusic"
)

app = Flask(__name__)
CORS(app)

'''
# MySQL configurations
db = MySQLdb.connect(host="127.0.0.1", #localhost changed to 127.0.0.1
                     user="root",            # Replace with your MySQL username
                     passwd="root",              # Replace with your MySQL password
                     port="8889",
                     db="iMusic")            # Replace with your database name
'''

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    step = data.get('step')  # Determine the step of registration
    cursor = db.cursor()

    if step == 1:
        # Handle email submission
        email = data.get('email')
        try:
            # Store email temporarily in the database or session
            query = "INSERT INTO users (email) VALUES (%s)"
            cursor.execute(query, (email,))
            db.commit()
            return jsonify({"message": "Email recorded, proceed to next step"}), 201
        except Exception as e:
            db.rollback()
            return jsonify({"message": "Failed to record email", "error": str(e)}), 500

    elif step == 2:
        # Handle password submission for the previously stored email
        email = data.get('email')
        password = data.get('password')

        # Hash password using bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        try:
            # Update the user record with the password
            query = "UPDATE users SET password = %s WHERE email = %s"
            cursor.execute(query, (hashed_password, email))
            db.commit()
            return jsonify({"message": "Registration completed successfully"}), 201
        except Exception as e:
            db.rollback()
            return jsonify({"message": "Failed to complete registration", "error": str(e)}), 500

    else:
        return jsonify({"message": "Invalid registration step"}), 400


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    cursor = db.cursor()
    try:
        query = "SELECT password FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        result = cursor.fetchone()

        if result:
            stored_password = result[0]

            # Compare hashed password with bcrypt
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

