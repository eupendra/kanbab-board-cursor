import requests
import json

def test_login():
    url = "http://localhost:8001/api/v1/login/access-token"
    data = {
        "username": "admin@example.com",
        "password": "admin"
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        response = requests.post(url, data=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print(f"Token: {token}")
            
            # Test getting current user
            user_url = "http://localhost:8001/api/v1/users/me"
            headers = {"Authorization": f"Bearer {token}"}
            user_response = requests.get(user_url, headers=headers)
            print(f"User Status Code: {user_response.status_code}")
            print(f"User Response: {user_response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login() 