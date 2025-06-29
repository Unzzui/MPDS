#!/usr/bin/env python3
"""
Simple API test script for StreetLifting API
"""
import requests
import json

# Configuration
BASE_URL = "http://192.168.31.226:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_auth_and_blocks():
    """Test authentication and blocks endpoints"""
    
    print("🔐 Testing StreetLifting API Authentication")
    print("=" * 50)
    
    # Step 1: Login to get token
    print("\n1. Logging in...")
    login_data = {
        "username": "admin",
        "password": "admin"
    }
    
    try:
        login_response = requests.post(
            f"{API_BASE}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data["access_token"]
            print(f"✅ Login successful! Token: {token[:20]}...")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Step 2: Test blocks endpoints with token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n2. Testing blocks endpoints...")
    
    # Test get all blocks
    try:
        blocks_response = requests.get(f"{API_BASE}/blocks/", headers=headers)
        print(f"📋 All blocks: {blocks_response.status_code}")
        if blocks_response.status_code == 200:
            blocks = blocks_response.json()
            print(f"   Found {len(blocks)} blocks")
        else:
            print(f"   Error: {blocks_response.text}")
    except Exception as e:
        print(f"❌ Error getting blocks: {e}")
    
    # Test get current block
    try:
        current_response = requests.get(f"{API_BASE}/blocks/current/", headers=headers)
        print(f"🎯 Current block: {current_response.status_code}")
        if current_response.status_code == 200:
            current_block = current_response.json()
            print(f"   Current block: {current_block.get('name', 'N/A')}")
        elif current_response.status_code == 404:
            print("   No active block found (this is normal if no blocks exist)")
        else:
            print(f"   Error: {current_response.text}")
    except Exception as e:
        print(f"❌ Error getting current block: {e}")
    
    # Step 3: Test without authentication (should fail)
    print("\n3. Testing without authentication (should fail)...")
    try:
        no_auth_response = requests.get(f"{API_BASE}/blocks/current/")
        print(f"🚫 No auth request: {no_auth_response.status_code}")
        if no_auth_response.status_code == 401:
            print("   ✅ Correctly rejected (authentication required)")
        else:
            print(f"   Unexpected response: {no_auth_response.text}")
    except Exception as e:
        print(f"❌ Error testing no auth: {e}")
    
    print("\n" + "=" * 50)
    print("✅ API test completed!")

if __name__ == "__main__":
    test_auth_and_blocks() 