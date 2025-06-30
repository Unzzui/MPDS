#!/bin/bash

echo "🔧 Solucionando problema de compatibilidad bcrypt/passlib..."

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

# Verificar que estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    print_error "Este script debe ejecutarse desde el directorio backend"
    exit 1
fi

print_status "Desinstalando versiones problemáticas..."
pip uninstall -y bcrypt passlib

print_status "Instalando versiones compatibles..."
pip install bcrypt==4.0.1
pip install passlib==1.7.4

print_status "Verificando instalación..."
python -c "import bcrypt; import passlib; print('✅ bcrypt y passlib instalados correctamente')"

print_success "Problema de compatibilidad solucionado!"
print_status "Ahora puedes iniciar el backend normalmente:"
echo "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" 