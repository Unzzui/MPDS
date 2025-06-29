#!/usr/bin/env python3
"""
Script to test the routines API functionality
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://192.168.31.226:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_routines_api():
    print("🏋️ Testing Routines API")
    print("=" * 50)
    
    # 1. Login to get token
    print("\n1. Iniciando sesión...")
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
            token = login_response.json()["access_token"]
            print("✅ Login exitoso!")
        else:
            print(f"❌ Login falló: {login_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return
    
    # 2. Test getting all routines
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n2. Probando obtener todas las rutinas...")
    try:
        routines_response = requests.get(f"{API_BASE}/routines/", headers=headers)
        print(f"Status: {routines_response.status_code}")
        if routines_response.status_code == 200:
            routines = routines_response.json()
            print(f"✅ Encontradas {len(routines)} rutinas")
            for routine in routines:
                print(f"   - {routine.get('name')} (ID: {routine.get('id')})")
        else:
            print(f"❌ Error: {routines_response.text}")
    except Exception as e:
        print(f"❌ Error obteniendo rutinas: {e}")
    
    # 3. Test getting templates
    print("\n3. Probando obtener plantillas...")
    try:
        templates_response = requests.get(f"{API_BASE}/routines/templates", headers=headers)
        print(f"Status: {templates_response.status_code}")
        if templates_response.status_code == 200:
            templates = templates_response.json()
            print(f"✅ Encontradas {len(templates)} plantillas")
            for template in templates:
                print(f"   - {template.get('name')} (ID: {template.get('id')})")
        else:
            print(f"❌ Error: {templates_response.text}")
    except Exception as e:
        print(f"❌ Error obteniendo plantillas: {e}")
    
    # 4. Test creating a custom routine
    print("\n4. Probando crear rutina personalizada...")
    custom_routine = {
        "name": "Mi Rutina Personalizada",
        "description": "Una rutina personalizada para testing",
        "exercises": ["Pull-Up", "Push-Up", "Squat"],
        "days": [1, 3, 5],
        "main_lifts": ["Pull-Up"],
        "is_active": True,
        "is_template": False
    }
    
    try:
        create_response = requests.post(
            f"{API_BASE}/routines/",
            json=custom_routine,
            headers=headers
        )
        print(f"Status: {create_response.status_code}")
        if create_response.status_code == 200:
            created_routine = create_response.json()
            print(f"✅ Rutina creada: {created_routine.get('name')} (ID: {created_routine.get('id')})")
            
            # 5. Test getting routines by day
            print("\n5. Probando obtener rutinas por día...")
            for day in [1, 3, 5]:
                day_response = requests.get(f"{API_BASE}/routines/day/{day}", headers=headers)
                print(f"   Día {day}: {day_response.status_code}")
                if day_response.status_code == 200:
                    day_routines = day_response.json()
                    print(f"   Rutinas para día {day}: {len(day_routines)}")
            
            # 6. Test activating the routine
            print("\n6. Probando activar rutina...")
            activate_response = requests.post(
                f"{API_BASE}/routines/{created_routine.get('id')}/activate",
                headers=headers
            )
            print(f"Status: {activate_response.status_code}")
            if activate_response.status_code == 200:
                print("✅ Rutina activada correctamente")
            
        else:
            print(f"❌ Error creando rutina: {create_response.text}")
    except Exception as e:
        print(f"❌ Error creando rutina: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Test de rutinas completado!")

if __name__ == "__main__":
    test_routines_api() 