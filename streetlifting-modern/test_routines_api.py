#!/usr/bin/env python3
"""
Test script for Routines API endpoints
"""

import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def get_auth_token() -> str:
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

def test_routines_endpoints(token: str):
    """Test all routines endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🔍 Testing Routines API Endpoints...")
    print("=" * 50)
    
    # Test 1: Get all routines
    print("\n1. Testing GET /routines/")
    try:
        response = requests.get(f"{API_BASE}/routines/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            routines = response.json()
            print(f"   Routines found: {len(routines)}")
            for routine in routines[:3]:  # Show first 3
                print(f"   - {routine.get('name', 'N/A')} (ID: {routine.get('id', 'N/A')})")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Get active routines
    print("\n2. Testing GET /routines/active/")
    try:
        response = requests.get(f"{API_BASE}/routines/active/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            active_routines = response.json()
            print(f"   Active routines found: {len(active_routines)}")
            for routine in active_routines:
                print(f"   - {routine.get('name', 'N/A')} (ID: {routine.get('id', 'N/A')})")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 3: Get routine templates
    print("\n3. Testing GET /routines/templates/")
    try:
        response = requests.get(f"{API_BASE}/routines/templates/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            templates = response.json()
            print(f"   Templates found: {len(templates)}")
            for template in templates[:3]:  # Show first 3
                print(f"   - {template.get('name', 'N/A')} (ID: {template.get('id', 'N/A')})")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 4: Get specific routine (if any exist)
    print("\n4. Testing GET /routines/{id}")
    try:
        # First get all routines to find an ID
        response = requests.get(f"{API_BASE}/routines/", headers=headers)
        if response.status_code == 200:
            routines = response.json()
            if routines:
                routine_id = routines[0]["id"]
                response = requests.get(f"{API_BASE}/routines/{routine_id}", headers=headers)
                print(f"   Status: {response.status_code}")
                if response.status_code == 200:
                    routine = response.json()
                    print(f"   Routine: {routine.get('name', 'N/A')}")
                    print(f"   Exercises: {len(routine.get('exercises', []))}")
                else:
                    print(f"   Error: {response.text}")
            else:
                print("   No routines found to test with")
        else:
            print(f"   Error getting routines: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")

def test_backend_connection():
    """Test basic backend connection"""
    print("🔍 Testing Backend Connection...")
    print("=" * 30)
    
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"Backend accessible: {response.status_code}")
        return True
    except Exception as e:
        print(f"Backend not accessible: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Routines API Test Script")
    print("=" * 50)
    
    # Test backend connection
    if not test_backend_connection():
        print("\n❌ Backend is not running. Please start the backend server first.")
        return
    
    # Get auth token
    print("\n🔐 Getting authentication token...")
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token")
        return
    
    print(f"✅ Token obtained: {token[:20]}...")
    
    # Test routines endpoints
    test_routines_endpoints(token)
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    main() 