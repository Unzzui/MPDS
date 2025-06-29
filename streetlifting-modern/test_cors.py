#!/usr/bin/env python3
"""
Simple CORS test script
"""

import requests

def test_cors():
    """Test CORS configuration"""
    print("🔍 Testing CORS Configuration...")
    print("=" * 40)
    
    # Test backend accessibility
    try:
        response = requests.get("http://192.168.31.226:8000/health")
        print(f"✅ Backend accessible: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False
    
    # Test CORS preflight
    try:
        headers = {
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization,Content-Type'
        }
        response = requests.options("http://192.168.31.226:8000/api/v1/routines/", headers=headers)
        print(f"✅ CORS preflight: {response.status_code}")
        print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not set')}")
        print(f"   Access-Control-Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'Not set')}")
        print(f"   Access-Control-Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'Not set')}")
    except Exception as e:
        print(f"❌ CORS preflight failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_cors() 