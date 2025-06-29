#!/usr/bin/env python3
"""
Script to create a test training block in the database
"""
import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://192.168.31.226:8000"
API_BASE = f"{BASE_URL}/api/v1"

def create_test_block():
    """Create a test training block"""
    
    print("🏋️ Creando Bloque de Entrenamiento de Prueba")
    print("=" * 50)
    
    # Step 1: Login to get token
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
            token_data = login_response.json()
            token = token_data["access_token"]
            print(f"✅ Login exitoso!")
        else:
            print(f"❌ Login falló: {login_response.status_code}")
            return
            
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return
    
    # Step 2: Create a test training block
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Datos del bloque de prueba
    block_data = {
        "name": "Bloque de Fuerza - Prueba",
        "description": "Un bloque de entrenamiento de prueba para testing del API",
        "start_date": datetime.now().strftime("%Y-%m-%d"),
        "duration_weeks": 6,
        "block_type": "strength",
        "is_active": True,
        "target_exercises": ["squat", "bench_press", "deadlift", "pullups", "dips"],
        "progression_type": "linear",
        "starting_weights": {
            "squat": 100,
            "bench_press": 80,
            "deadlift": 120,
            "pullups": 5,
            "dips": 8
        },
        "weekly_increase": {
            "squat": 5,
            "bench_press": 2.5,
            "deadlift": 5,
            "pullups": 1,
            "dips": 1
        },
        "strategy": "Progresión Lineal",
        "notes": "Bloque de prueba para verificar el funcionamiento del sistema"
    }
    
    print("\n2. Creando bloque de entrenamiento...")
    try:
        create_response = requests.post(
            f"{API_BASE}/blocks/",
            json=block_data,
            headers=headers
        )
        
        if create_response.status_code == 200:
            created_block = create_response.json()
            print(f"✅ Bloque creado exitosamente!")
            print(f"   ID: {created_block.get('id')}")
            print(f"   Nombre: {created_block.get('name')}")
            print(f"   Activo: {created_block.get('is_active')}")
            print(f"   Duración: {created_block.get('duration_weeks')} semanas")
            print(f"   Tipo: {created_block.get('block_type')}")
        else:
            print(f"❌ Falló al crear bloque: {create_response.status_code}")
            print(f"   Respuesta: {create_response.text}")
            return
            
    except Exception as e:
        print(f"❌ Error creando bloque: {e}")
        return
    
    # Step 3: Test getting current block
    print("\n3. Probando endpoint de bloque actual...")
    try:
        current_response = requests.get(f"{API_BASE}/blocks/current/", headers=headers)
        print(f"🎯 Bloque actual: {current_response.status_code}")
        if current_response.status_code == 200:
            current_block = current_response.json()
            print(f"   ✅ Bloque actual encontrado: {current_block.get('name')}")
            print(f"   Semana actual: {current_block.get('current_week', 'N/A')}")
            print(f"   Progreso: {current_block.get('progress_percentage', 'N/A')}%")
        else:
            print(f"   ❌ Error: {current_response.text}")
    except Exception as e:
        print(f"❌ Error obteniendo bloque actual: {e}")
    
    # Step 4: Test getting all blocks
    print("\n4. Probando endpoint de todos los bloques...")
    try:
        blocks_response = requests.get(f"{API_BASE}/blocks/", headers=headers)
        print(f"📋 Todos los bloques: {blocks_response.status_code}")
        if blocks_response.status_code == 200:
            blocks = blocks_response.json()
            print(f"   ✅ Encontrados {len(blocks)} bloques")
            for i, block in enumerate(blocks, 1):
                print(f"   {i}. {block.get('name')} (ID: {block.get('id')})")
        else:
            print(f"   ❌ Error: {blocks_response.text}")
    except Exception as e:
        print(f"❌ Error obteniendo bloques: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Creación de bloque de prueba completada!")
    print("\n🎉 Ahora puedes:")
    print("   - Ver el bloque en el frontend")
    print("   - Probar todas las funcionalidades")
    print("   - Crear más bloques desde la UI")

if __name__ == "__main__":
    create_test_block() 