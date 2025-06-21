import requests
import time
import json
import hmac
import hashlib
import os

LUMEN_CLIENT_SECRET = os.getenv("LUMEN_CLIENT_SECRET", "1970356f3958cf95f6cd96b67293d8d21edc55e0bcaefbf24e47585e2f08dd4b")
BASE_URL = "http://127.0.0.1:8000/api/v1"

class LumenClient:
    def __init__(self):
        self.pat = None
        self.session = requests.Session()

    def login(self):
        print("--- Starting Lumen CLI Login ---")
        try:
            response = self.session.post(f"{BASE_URL}/cli/device-auth")
            response.raise_for_status()
            data = response.json()
            
            device_code = data['device_code']
            user_code = data['user_code']
            verification_uri = data['verification_uri']
            interval = data['interval']
            expires_in = data['expires_in']

            print(f"\n1. Please go to: {verification_uri}")
            print(f"2. And enter this code: {user_code}\n")

            start_time = time.time()
            while time.time() - start_time < expires_in:
                print("   Polling for authorization...")
                time.sleep(interval)
                try:
                    token_response = self.session.post(f"{BASE_URL}/cli/token", params={"device_code": device_code})
                    if token_response.status_code == 200:
                        self.pat = token_response.json()['access_token']
                        print("\n✅ Success! Device authorized.")
                        print(f"   PAT received: {self.pat[:11]}...")
                        return True
                except requests.RequestException:
                    pass
            
            print("\n❌ Error: Authorization timed out.")
            return False

        except requests.RequestException as e:
            print(f"❌ Error during login: {e}")
            if e.response:
                print(f"   Response: {e.response.json()}")
            return False

    def contribute(self, codebase: str):
        if not self.pat:
            print("❌ Error: You must be logged in to contribute.")
            return

        print("\n--- Starting Contribution ---")
        try:
            print("1. Performing handshake...")
            headers = {"Authorization": f"Bearer {self.pat}"}
            handshake_res = self.session.post(f"{BASE_URL}/cli/handshake", headers=headers)
            handshake_res.raise_for_status()
            challenge = handshake_res.text.strip('"')
            print(f"   Challenge received: {challenge}")

            timestamp = str(int(time.time()))
            body = json.dumps({"codebase": codebase}).encode('utf-8')
            
            body_hash = hashlib.sha256(body).hexdigest()
            string_to_sign = f"{challenge}:{timestamp}:{body_hash}".encode()
            secret = LUMEN_CLIENT_SECRET.encode()
            signature = hmac.new(secret, string_to_sign, hashlib.sha256).hexdigest()
            print("2. Request signed successfully.")

            contrib_headers = {
                "Authorization": f"Bearer {self.pat}",
                "Content-Type": "application/json",
                "X-Lumen-Challenge": challenge,
                "X-Lumen-Timestamp": timestamp,
                "X-Lumen-Signature": signature
            }
            print("3. Submitting contribution...")
            contrib_res = self.session.post(f"{BASE_URL}/cli/contribute", headers=contrib_headers, data=body)
            contrib_res.raise_for_status()

            print(f"\n✅ Contribution successful! Server says: {contrib_res.json()}")

        except requests.RequestException as e:
            print(f"❌ Error during contribution: {e}")
            if e.response:
                print(f"   Response: {e.response.json()}")


if __name__ == "__main__":
    client = LumenClient()
    
    if client.login():
        test_project_codebase = """
--- file: main.py
def calculate_sum(a, b):
    # This is a simple function
    if a is None or b is None:
        return 0
    return a + b

class MyClass:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"Hello, {self.name}")
        for i in range(5000000):
            print("xd lets lose time")

--- file: utils/helpers.js
function formatData(data) {
    return data.trim().toLowerCase();
}
"""
        client.contribute(codebase=test_project_codebase)