import os
import requests
from dotenv import load_dotenv
import socket

# Force Python to prefer IPv4 over IPv6
orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(*args, **kwargs):
    return [ai for ai in orig_getaddrinfo(*args, **kwargs) if ai[0] == socket.AF_INET]
socket.getaddrinfo = getaddrinfo_ipv4

# Load .env file
load_dotenv()

API_KEY = os.getenv("ELEVENLABS_API_KEY")

if not API_KEY:
    print("❌ No API key found. Make sure ELEVENLABS_API_KEY is set in your .env file.")
    exit(1)

# Test endpoint – fetch user info
url = "https://api.elevenlabs.io/v1/user"
headers = {"xi-api-key": API_KEY}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
except requests.exceptions.RequestException as e:
    print("❌ Connection error:", e)
