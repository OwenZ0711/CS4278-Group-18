import Authentication as auth
import urllib.parse
import requests
from flask import Flask, request, redirect, session, url_for, jsonify
from datetime import datetime

def is_token_expired():
  expires_at = session.get('expires_at')
  if expires_at:
    return datetime.now().timestamp() > expires_at
  return True

app_main = Flask(__name__)
app_main.secret_key = "427842784278427842784278"

@app_main.route('/')
def root():
  return redirect("/musicApp")

@app_main.route('/musicApp')
def index():
  state = None
  scope = None
  return("Welcome! Please <a href='/musicApp/login'>login with your Spotify account</a>.")

@app_main.route("/musicApp/login")
def user_login():
  print("user login page\n")
  print("if access token in session:",bool("access_token" in session))
  if 'access_token' in session and not is_token_expired():
    print("authenticated, no need again \n")
    return redirect("/musicApp/playlists")  # Skip authentication, go directly to playlists if already have access
  print("authentication needed \n")
  scope = 'user-read-private user-read-email'
  params = {
            'response_type': 'code',
            'client_id': auth.CLIENT_ID,
            'scope': scope,
            'redirect_uri': auth.REDIRECT_URI,
            'show dialog': True
        }
  auth_url = f"{auth.AUTH_URL}?{urllib.parse.urlencode(params)}"
  print(auth_url)
  print("redirecting to auth url... \n")
  return redirect(auth_url)

@app_main.route("/musicApp/callback")
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
        'redirect_uri': auth.REDIRECT_URI,
        'client_id': auth.CLIENT_ID,
        'client_secret': auth.CLIENT_SECRET_ID
    }
    response = requests.post(auth.TOKEN_URL, data=req_body)
    token_info = response.json()

    # Store tokens and expiration time in the session
    session['access_token'] = token_info['access_token']
    session['refresh_token'] = token_info['refresh_token']
    session['expires_at'] = datetime.now().timestamp() + token_info['expires_in']

    return redirect("/musicApp/playlists")
 
@app_main.route('/musicApp/playlists')
def get_playlists():
    if 'access_token' not in session:
        return redirect('/musicApp/login')

    if datetime.now().timestamp() > session['expires_at']:
        return redirect('/musicApp/refresh-token')

    headers = {
        'Authorization': f"Bearer {session['access_token']}"
    }
    response = requests.get(auth.API_BASE_URL + "me/playlists",headers=headers)
    playlists = response.json()
    return jsonify(playlists)
    
    
@app_main.route('/musicApp/refresh-token')
def refresh_token():
  if 'refresh_token' not in session:
    return redirect('/musicApp/login')
  if datetime.now().timestamp() > session['expires_at']:
    req_body = {
      'grant_type': 'refresh_token',
      'refresh_token': session['refresh_token'],
      'client_id': auth.CLIENT_ID,
      'client_secret': auth.CLIENT_SECRET_ID
    }
    response = requests.post(auth.TOKEN_URL, data=req_body)
    new_token_info = response.json()

    session['access_token'] = new_token_info['access_token']
    session['expires_at'] = datetime.now().timestamp() + new_token_info['expires_in']
    return redirect('/musicApp/playlists')
        
if __name__ == '__main__':
  app_main.run(debug=True)
    
