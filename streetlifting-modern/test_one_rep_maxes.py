#!/usr/bin/env python3
"""
Test script for OneRepMax API endpoints
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def get_auth_token():
    """Get authentication token"""
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = requests.post(f"{API_BASE}/auth/login", data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def test_one_rep_maxes(token):
    """Test OneRepMax endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🏋️ Testing OneRepMax API Endpoints...")
    print("=" * 50)
    
    # Test 1: Get all OneRepMax records
    print("\n1. Testing GET /one-rep-maxes/")
    try:
        response = requests.get(f"{API_BASE}/one-rep-maxes/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            one_rms = response.json()
            print(f"   OneRepMax records found: {len(one_rms)}")
            for one_rm in one_rms:
                print(f"   - {one_rm.get('exercise', 'N/A')}: {one_rm.get('one_rm', 'N/A')}kg ({one_rm.get('date_achieved', 'N/A')})")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Create a new OneRepMax record
    print("\n2. Testing POST /one-rep-maxes/")
    try:
        new_one_rm = {
            "exercise": "Test Exercise",
            "one_rm": 75.0,
            "date_achieved": "2024-12-26"
        }
        response = requests.post(f"{API_BASE}/one-rep-maxes/", json=new_one_rm, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            created = response.json()
            print(f"   Created: {created.get('exercise', 'N/A')}: {created.get('one_rm', 'N/A')}kg")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 3: Get suggested weights
    print("\n3. Testing GET /training/suggested-weights")
    try:
        response = requests.get(f"{API_BASE}/training/suggested-weights", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            weights = response.json()
            print(f"   Suggested weights found: {len(weights)}")
            for weight in weights:
                print(f"   - {weight.get('exercise', 'N/A')}: 3x3={weight.get('weights_3x3', 'N/A')}kg, 3x5={weight.get('weights_3x5', 'N/A')}kg, 3x8={weight.get('weights_3x8', 'N/A')}kg")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")

def main():
    """Main test function"""
    print("🚀 OneRepMax API Test Script")
    print("=" * 50)
    
    # Get auth token
    print("\n🔐 Getting authentication token...")
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token")
        return
    
    print(f"✅ Token obtained: {token[:20]}...")
    
    # Test OneRepMax endpoints
    test_one_rep_maxes(token)
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    main() 