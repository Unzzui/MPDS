#!/usr/bin/env python3
"""
Script de debug para crear un bloque de entrenamiento y ver exactamente qué está pasando
"""
import requests
import json
from datetime import datetime, timedelta

# Configuración
BASE_URL = "http://192.168.31.226:8000"
API_BASE = f"{BASE_URL}/api/v1"

def debug_block_creation():
    print("🔍 Debug: Creando Bloque de Entrenamiento")
    print("=" * 50)

    # 1. Login para obtener token
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

    # 2. Crear bloque de prueba con datos mínimos
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    today = datetime.now().date()
    duration = 6
    
    # Datos mínimos según el schema
    block_data = {
        "name": "Bloque de Fuerza - Prueba",
        "duration": duration,
        "total_weeks": duration,
        "current_stage": "Fase 1",
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(weeks=duration)).isoformat(),
        "current_week": 1,
        "rm_pullups": 10.0,
        "rm_dips": 20.0,
        "rm_muscleups": 5.0,
        "rm_squats": 100.0,
        "strategy": "Progresión Lineal",
        "weekly_increment": 2.5,
        "increment_type": "percentage",  # Cambiado a percentage (valor por defecto)
        "stages": []
    }
    
    print("\n2. Datos que se van a enviar:")
    print(json.dumps(block_data, indent=2, default=str))
    
    print("\n3. Creando bloque de entrenamiento...")
    try:
        create_response = requests.post(
            f"{API_BASE}/blocks/",
            json=block_data,
            headers=headers
        )
        
        print(f"Status Code: {create_response.status_code}")
        print(f"Response Headers: {dict(create_response.headers)}")
        
        if create_response.status_code == 200:
            created_block = create_response.json()
            print(f"✅ Bloque creado exitosamente!")
            print(f"   ID: {created_block.get('id')}")
            print(f"   Nombre: {created_block.get('name')}")
            print(f"   Activo: {created_block.get('is_active')}")
            print(f"   Duración: {created_block.get('duration')} semanas")
            print(f"   Tipo: {created_block.get('strategy')}")
        else:
            print(f"❌ Falló al crear bloque: {create_response.status_code}")
            print(f"   Respuesta completa: {create_response.text}")
            
            # Intentar parsear el error como JSON
            try:
                error_data = create_response.json()
                print(f"   Error parseado: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Error no es JSON válido")
            return
    except Exception as e:
        print(f"❌ Error creando bloque: {e}")
        return

    print("\n¡Debug completado!")

if __name__ == "__main__":
    debug_block_creation() 