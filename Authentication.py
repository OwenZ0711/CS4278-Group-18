from oauthlib.oauth2 import WebApplicationClient
import urllib.parse
import requests
from flask import Flask, request, redirect, session, url_for, jsonify
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, render_template, flash, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import time


CLIENT_ID = '5de8da9998ff4436abab42f799e1476c' # trail clients id
CLIENT_SECRET_ID = 'ed07ca9837c240fea4b153a56566f3b0'
REDIRECT_URI = 'http://127.0.0.1:5000/loading'
AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'


def is_token_expired():
  expires_at = session.get('expires_at')
  if expires_at:
    return datetime.now().timestamp() > expires_at
  return True

app_main = Flask(__name__)
app_main.config['SECRET_KEY'] = 'your_secret_key'
app_main.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # Or any other database
db = SQLAlchemy(app_main)
login_manager = LoginManager(app_main)
app_main.secret_key = "427842784278427842784278"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
  # use user_id to find user information in User class table?

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    spotify_token = db.Column(db.String(500))  # Store access token here
    spotify_refresh_token = db.Column(db.String(500))

@app_main.route('/')
def index():
    state = None
    scope = None
    return("Welcome! Please <a href='/login'>login with your Spotify account</a>. Welcome! Please <a href='/register'>register with your Spotify account</a>.")

@app_main.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        hashed_password = generate_password_hash(password, method='sha256')
        session['new_email'] = email
        session['new_password'] = password
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('/ogin'))
    
    return render_template('register.html')

@app_main.route("/login", methods=['GET', 'POST'])
def user_login():
    session['user_email'] = "owen"
    print("user login page\n")
    print("authentication needed \n")
    scope = 'user-read-private user-read-email playlist-read-private'
    params = {
              'response_type': 'code',
              'client_id': CLIENT_ID,
              'scope': scope,
              'redirect_uri': REDIRECT_URI,
              'show dialog': False
          }
    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"
    print(auth_url)
    print("redirecting to auth url... \n")
    return redirect(auth_url)

@app_main.route("/loading")
def callback():
    print('callback called')
    if 'error' in request.args:
      return jsonify({"error": request.args['error']})
    
    if 'code' in request.args:
      code = request.args['code']
      # Exchange the code for an access token
      req_body = {
          'code': code,
          'grant_type': 'authorization_code',
          'redirect_uri': REDIRECT_URI,
          'client_id': CLIENT_ID,
          'client_secret': CLIENT_SECRET_ID
      }
      response = requests.post(TOKEN_URL, data=req_body)
      token_info = response.json()
      session['access_token'] = token_info['access_token']
      session['refresh_token'] = token_info['refresh_token']
      session['expires_at'] = datetime.now().timestamp() + token_info['expires_in']
      print(f"Access_token: {session['access_toekn']}")
      print("redirect to playlist")
      return redirect("/playlists")
 
@app_main.route('/playlists')
def get_playlists():
    print(session["user_email"])
    if 'access_token' not in session:
        return redirect('/musicApp/login')

    if datetime.now().timestamp() > session['expires_at']:
        return redirect('/musicApp/refresh-token')

    headers = {
        'Authorization': f"Bearer {session['access_token']}"
    }
    response = requests.get(API_BASE_URL + "me",headers=headers)
    session.pop('access_token', None)
    session.pop('refresh_token', None)
    session.pop('expires_at', None)
    user_info = response.json()
    # artist list finish here
    # new_user = User(email=session['new_email'], password=session['new_password'])#, artist = artist)
    return jsonify(user_info)
    
        
if __name__ == '__main__':
    app_main.run(host='127.0.0.1', port=5000, debug=True)






