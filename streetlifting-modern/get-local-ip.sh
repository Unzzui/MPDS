#!/bin/bash

echo "🔍 Obteniendo IP local para desarrollo móvil..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Obtener IP local
print_status "Detectando IP local..."

# Intentar diferentes métodos para obtener la IP
LOCAL_IP=""

# Método 1: ip route (Linux)
if command -v ip &> /dev/null; then
    LOCAL_IP=$(ip route get 1.1.1.1 | awk '{print $7}' | head -1)
    if [ ! -z "$LOCAL_IP" ] && [ "$LOCAL_IP" != "dev" ]; then
        print_success "IP detectada (ip route): $LOCAL_IP"
    fi
fi

# Método 2: hostname -I (Linux)
if [ -z "$LOCAL_IP" ] && command -v hostname &> /dev/null; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    if [ ! -z "$LOCAL_IP" ]; then
        print_success "IP detectada (hostname): $LOCAL_IP"
    fi
fi

# Método 3: ifconfig (macOS/Linux)
if [ -z "$LOCAL_IP" ] && command -v ifconfig &> /dev/null; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    if [ ! -z "$LOCAL_IP" ]; then
        print_success "IP detectada (ifconfig): $LOCAL_IP"
    fi
fi

# Método 4: ipconfig (Windows)
if [ -z "$LOCAL_IP" ] && command -v ipconfig &> /dev/null; then
    LOCAL_IP=$(ipconfig | grep "IPv4" | awk '{print $NF}' | head -1)
    if [ ! -z "$LOCAL_IP" ]; then
        print_success "IP detectada (ipconfig): $LOCAL_IP"
    fi
fi

if [ -z "$LOCAL_IP" ]; then
    print_error "No se pudo detectar la IP local automáticamente"
    print_status "Por favor, configura manualmente en environment.ts"
    exit 1
fi

echo ""
echo "=========================================="
echo "🌐 CONFIGURACIÓN PARA DESARROLLO MÓVIL"
echo "=========================================="
echo "IP Local: $LOCAL_IP"
echo ""
echo "📱 Para acceder desde móvil:"
echo "Frontend: http://$LOCAL_IP:5173"
echo "Backend:  http://$LOCAL_IP:8000"
echo ""
echo "🔧 Configuración necesaria:"
echo "1. Actualizar environment.ts con tu IP"
echo "2. Iniciar backend en 0.0.0.0:8000"
echo "3. Iniciar frontend en 0.0.0.0:5173"
echo ""
echo "📋 Comandos para iniciar:"
echo ""
echo "# Terminal 1: Backend"
echo "cd streetlifting-modern/backend"
echo "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "# Terminal 2: Frontend"
echo "cd streetlifting-modern/frontend"
echo "npm run dev -- --host 0.0.0.0"
echo ""
echo "=========================================="

# Actualizar automáticamente environment.ts si existe
ENV_FILE="streetlifting-modern/frontend/src/config/environment.ts"
if [ -f "$ENV_FILE" ]; then
    print_status "Actualizando environment.ts con tu IP..."
    
    # Crear backup
    cp "$ENV_FILE" "$ENV_FILE.backup"
    
    # Actualizar la IP en el archivo
    sed -i "s/http:\/\/192\.168\.1\.100:8000/http:\/\/$LOCAL_IP:8000/g" "$ENV_FILE"
    
    print_success "environment.ts actualizado con IP: $LOCAL_IP"
    print_warning "Backup guardado en: $ENV_FILE.backup"
else
    print_warning "No se encontró environment.ts, actualiza manualmente:"
    echo "apiBaseUrl = 'http://$LOCAL_IP:8000';"
fi

echo ""
print_success "¡Configuración completada!"
print_status "Ahora puedes acceder desde tu móvil usando la IP: $LOCAL_IP" 