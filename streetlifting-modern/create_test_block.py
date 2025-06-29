#!/usr/bin/env python3
"""
Script para crear un bloque de entrenamiento de prueba en la base de datos
"""
import requests
from datetime import datetime, timedelta

# Configuración
BASE_URL = "http://192.168.31.226:8000"
API_BASE = f"{BASE_URL}/api/v1"


def create_test_block():
    print("🏋️ Creando Bloque de Entrenamiento de Prueba")
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

    # 2. Crear bloque de prueba
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    today = datetime.now().date()
    duration = 6
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
        "increment_type": "absolute",
        "deload_week": 4,
        "routines_by_day": None,
        "stages": [
            {
                "name": "Fase 1",
                "week_number": 1,
                "load_percentage": 70.0,
                "description": "Semana de introducción"
            },
            {
                "name": "Fase 2",
                "week_number": 2,
                "load_percentage": 75.0,
                "description": "Semana de carga"
            }
        ]
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
            print(f"   Duración: {created_block.get('duration')} semanas")
            print(f"   Tipo: {created_block.get('strategy')}")
        else:
            print(f"❌ Falló al crear bloque: {create_response.status_code}")
            print(f"   Respuesta: {create_response.text}")
            return
    except Exception as e:
        print(f"❌ Error creando bloque: {e}")
        return

    print("\n¡Listo! Ahora puedes ver el bloque en el frontend.")

if __name__ == "__main__":
    create_test_block()
