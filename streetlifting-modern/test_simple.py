#!/usr/bin/env python3
"""
Simple test script to verify backend connectivity
"""

import requests
import time

def test_backend():
    """Test backend connectivity"""
    print("🔍 Testing Backend Connectivity...")
    print("=" * 40)
    
    urls = [
        "http://localhost:8000/health",
        "http://127.0.0.1:8000/health",
        "http://192.168.31.226:8000/health"
    ]
    
    for url in urls:
        try:
            print(f"\nTesting: {url}")
            response = requests.get(url, timeout=5)
            print(f"✅ Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            return url
        except requests.exceptions.ConnectionError:
            print(f"❌ Connection failed")
        except requests.exceptions.Timeout:
            print(f"❌ Timeout")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    return None

def test_cors(url):
    """Test CORS with the working URL"""
    if not url:
        print("\n❌ No working backend URL found")
        return
    
    print(f"\n🔍 Testing CORS with: {url}")
    print("=" * 40)
    
    try:
        headers = {
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization,Content-Type'
        }
        response = requests.options(f"{url}/api/v1/routines/", headers=headers)
        print(f"✅ CORS preflight: {response.status_code}")
        print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not set')}")
    except Exception as e:
        print(f"❌ CORS test failed: {e}")

if __name__ == "__main__":
    working_url = test_backend()
    test_cors(working_url) 