import os
import requests
from oauthlib.oauth2 import WebApplicationClient
from requests.auth import HTTPBasicAuth
from flask import jsonify, request

CLIENT_ID = '5de8da9998ff4436abab42f799e1476c' # trail clients id
CLIENT_SECRET_ID = 'ed07ca9837c240fea4b153a56566f3b0'
REDIRECT_URI = 'http://127.0.0.1:5000/musicApp/callback'
AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

def process_code(code):
    """Helper function to handle the authorization code."""
    
    return jsonify({"message": "Code processed successfully", "code": code})

def fetch_client_auth():
    pass
  
  
def general_auth():
    pass




